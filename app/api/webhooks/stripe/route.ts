
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const relevantEvents = new Set([
  'checkout.session.completed',
  'account.updated',
  'transfer.succeeded',
  'transfer.failed',
  'charge.succeeded', // For direct charges, though we're using Connect for payouts
  'charge.failed',
]);

/**
 * Handles Stripe webhook events.
 * This route is responsible for verifying the webhook signature and processing various Stripe events
 * to update the application's database, such as recording payments or updating contractor's Stripe Connect status.
 * @param {Request} req - The incoming request object from Stripe.
 * @returns {Promise<NextResponse>} - A response indicating success or failure of webhook processing.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (!relevantEvents.has(event.type)) {
    console.log(`Received irrelevant event type: ${event.type}`);
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  }

  try {
    // Cast to string to handle event types that may not be in Stripe's TypeScript definitions
    switch (event.type as string) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const leadId = checkoutSession.metadata?.leadId;
        const contractorId = checkoutSession.metadata?.contractorId;
        const amountTotal = checkoutSession.amount_total;
        const currency = checkoutSession.currency;
        const paymentIntentId = checkoutSession.payment_intent as string;

        if (!leadId || !contractorId || !amountTotal || !currency || !paymentIntentId) {
          console.error('Missing metadata or essential data in checkout.session.completed event', checkoutSession);
          return new NextResponse('Missing data', { status: 400 });
        }

        // Get the project_lead to get project_id
        const { data: projectLead, error: getLeadError } = await supabase
          .from('project_leads')
          .select('project_id, contractor_id')
          .eq('id', leadId)
          .single();

        if (getLeadError || !projectLead) {
          console.error('Error getting project lead:', getLeadError?.message);
          return new NextResponse(`Webhook Error: Failed to get lead: ${getLeadError?.message}`, { status: 500 });
        }

        // Get the project to get homeowner_id (payer)
        const { data: project, error: getProjectError } = await supabase
          .from('projects')
          .select('homeowner_id')
          .eq('id', projectLead.project_id)
          .single();

        if (getProjectError || !project) {
          console.error('Error getting project:', getProjectError?.message);
          return new NextResponse(`Webhook Error: Failed to get project: ${getProjectError?.message}`, { status: 500 });
        }

        // Update project_leads status to 'purchased' and record payment
        const { error: updateLeadError } = await supabase
          .from('project_leads')
          .update({ status: 'purchased', purchased_at: new Date().toISOString() })
          .eq('id', leadId);

        if (updateLeadError) {
          console.error('Error updating project lead status:', updateLeadError.message);
          return new NextResponse(`Webhook Error: Failed to update lead status: ${updateLeadError.message}`, { status: 500 });
        }

        // Insert payment record
        const { error: insertPaymentError } = await supabase.from('payments').insert({
          project_id: projectLead.project_id,
          payer_id: project.homeowner_id,
          payee_id: projectLead.contractor_id,
          amount: amountTotal / 100, // Stripe amounts are in cents
          currency: currency,
          stripe_charge_id: paymentIntentId,
          status: 'succeeded',
          payment_type: 'lead_purchase',
        });

        if (insertPaymentError) {
          console.error('Error inserting payment record:', insertPaymentError.message);
          return new NextResponse(`Webhook Error: Failed to insert payment record: ${insertPaymentError.message}`, { status: 500 });
        }
        console.log(`Checkout session completed for lead ${leadId} by contractor ${contractorId}`);
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        const stripeAccountId = account.id;

        // Check if the account has all capabilities enabled and charges are enabled
        const chargesEnabled = account.charges_enabled;
        const payoutsEnabled = account.payouts_enabled;
        const detailsSubmitted = account.details_submitted;

        if (chargesEnabled && payoutsEnabled && detailsSubmitted) {
          const { error: updateProfileError } = await supabase
            .from('contractor_profiles')
            .update({ is_verified: true })
            .eq('stripe_account_id', stripeAccountId);

          if (updateProfileError) {
            console.error('Error updating contractor profile for onboarding completion:', updateProfileError.message);
            return new NextResponse(`Webhook Error: Failed to update contractor profile: ${updateProfileError.message}`, { status: 500 });
          }
          console.log(`Contractor Stripe account ${stripeAccountId} onboarding complete.`);
        } else {
          console.log(`Contractor Stripe account ${stripeAccountId} updated, but not yet complete.`);
        }
        break;

      case 'transfer.succeeded':
        const transferSucceeded = event.data.object as Stripe.Transfer;
        // Update payment status for payouts
        const { error: updatePayoutSuccessError } = await supabase
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('id', transferSucceeded.id);

        if (updatePayoutSuccessError) {
          console.error('Error updating payout status to succeeded:', updatePayoutSuccessError.message);
          return new NextResponse(`Webhook Error: Failed to update payout status: ${updatePayoutSuccessError.message}`, { status: 500 });
        }
        console.log(`Transfer ${transferSucceeded.id} succeeded.`);
        break;

      case 'transfer.failed':
        const transferFailed = event.data.object as Stripe.Transfer;
        // Update payment status for failed payouts
        const { error: updatePayoutFailedError } = await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', transferFailed.id);

        if (updatePayoutFailedError) {
          console.error('Error updating payout status to failed:', updatePayoutFailedError.message);
          return new NextResponse(`Webhook Error: Failed to update payout status: ${updatePayoutFailedError.message}`, { status: 500 });
        }
        console.log(`Transfer ${transferFailed.id} failed.`);
        break;

      case 'charge.succeeded': // This might be for direct charges, but can also be used for Connect charges
        const chargeSucceeded = event.data.object as Stripe.Charge;
        // If we are doing direct charges or need to track charges separately
        console.log(`Charge ${chargeSucceeded.id} succeeded.`);
        break;

      case 'charge.failed':
        const chargeFailed = event.data.object as Stripe.Charge;
        // If we are doing direct charges or need to track charges separately
        console.log(`Charge ${chargeFailed.id} failed. Reason: ${chargeFailed.failure_message}`);
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('Error processing Stripe webhook event:', error);
    return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
