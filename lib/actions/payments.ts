
'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type Tables = Database['public']['Tables'];
type ContractorProfile = Tables['contractor_profiles']['Row'];
type ProjectLead = Tables['project_leads']['Row'];
type Payment = Tables['payments']['Row'];

/**
 * Initiates the Stripe Connect onboarding process for a contractor.
 * Creates an account link and returns the URL for the contractor to complete onboarding.
 * @returns {Promise<{ success: boolean; url?: string; error?: string }>} - The URL for onboarding or an error.
 */
export async function onboardStripeConnect(): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    // Check if contractor already has a Stripe account ID
    const { data: contractorProfile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !contractorProfile) {
      console.error('Error fetching contractor profile:', profileError?.message);
      return { success: false, error: 'Contractor profile not found.' };
    }

    let accountId = contractorProfile.stripe_account_id;

    if (!accountId) {
      // Create a new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Assuming US for now, can be dynamic
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // Can be dynamic
      });
      accountId = account.id;

      // Save the Stripe account ID to the contractor's profile
      const { error: updateError } = await supabase
        .from('contractor_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating contractor profile with Stripe account ID:', updateError.message);
        return { success: false, error: 'Failed to save Stripe account ID.' };
      }
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/contractor-dashboard?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/contractor-dashboard?onboarding_complete=true`,
      type: 'account_onboarding',
    });

    return { success: true, url: accountLink.url };
  } catch (error) {
    console.error('Error in Stripe Connect onboarding:', error);
    return { success: false, error: 'Failed to initiate Stripe Connect onboarding.' };
  }
}

const createCheckoutSessionSchema = z.object({
  leadId: z.string().uuid(),
  priceInCents: z.number().int().positive(),
  contractorId: z.string().uuid(),
});

/**
 * Creates a Stripe Checkout session for purchasing a lead.
 * @param {object} params - The parameters for creating the checkout session.
 * @param {string} params.leadId - The ID of the project lead being purchased.
 * @param {number} params.priceInCents - The price of the lead in cents.
 * @param {string} params.contractorId - The ID of the contractor purchasing the lead.
 * @returns {Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }>} - The session ID and URL or an error.
 */
export async function createCheckoutSession({
  leadId,
  priceInCents,
  contractorId,
}: z.infer<typeof createCheckoutSessionSchema>): Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== contractorId) {
    return { success: false, error: 'Unauthorized: User must be the contractor purchasing the lead.' };
  }

  const validation = createCheckoutSessionSchema.safeParse({ leadId, priceInCents, contractorId });
  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }

  try {
    // Check if the lead is already purchased by this contractor
    const { data: existingLead, error: existingLeadError } = await supabase
      .from('project_leads')
      .select('status')
      .eq('lead_id', leadId)
      .eq('contractor_id', contractorId)
      .single();

    if (existingLeadError && existingLeadError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing lead status:', existingLeadError.message);
      return { success: false, error: 'Failed to check lead status.' };
    }

    if (existingLead && existingLead.status === 'purchased') {
      return { success: false, error: 'This lead has already been purchased by you.' };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Lead Purchase for Project ${leadId}`,
              description: 'Access to homeowner contact information and project details.',
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${leadId}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${leadId}?payment_cancelled=true`,
      metadata: {
        leadId,
        contractorId,
      },
    });

    if (!session.url || !session.id) {
      return { success: false, error: 'Failed to create Stripe Checkout session URL.' };
    }

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: 'Failed to create checkout session.' };
  }
}

/**
 * Handles payout to a contractor. This would typically be triggered by an admin or an automated process.
 * @param {string} contractorId - The ID of the contractor to pay.
 * @param {number} amountInCents - The amount to payout in cents.
 * @param {string} projectId - The ID of the project associated with the payout.
 * @returns {Promise<{ success: boolean; transferId?: string; error?: string }>} - The transfer ID or an error.
 */
export async function createContractorPayout({
  contractorId,
  amountInCents,
  projectId,
}: {
  contractorId: string;
  amountInCents: number;
  projectId: string;
}): Promise<{ success: boolean; transferId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic authorization check: Only admins or an automated system should trigger this.
  // For now, let's assume an admin is doing it.
  // In a real application, you'd have more robust role-based access control.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  if (profileError || profile?.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Only administrators can initiate payouts.' };
  }

  try {
    // Retrieve the contractor's Stripe account ID
    const { data: contractorProfile, error: contractorProfileError } = await supabase
      .from('contractor_profiles')
      .select('stripe_account_id')
      .eq('id', contractorId)
      .single();

    if (contractorProfileError || !contractorProfile?.stripe_account_id) {
      console.error('Error fetching contractor Stripe account ID:', contractorProfileError?.message);
      return { success: false, error: 'Contractor Stripe account not found.' };
    }

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: contractorProfile.stripe_account_id,
      metadata: {
        projectId,
        contractorId,
      },
    });

    // Record the payout in the payments table
    // payee_id = contractor receiving the payout
    // payer_id = platform/system (using user.id as the admin initiating the payout)
    const { error: paymentInsertError } = await supabase.from('payments').insert({
      id: transfer.id,
      amount: amountInCents,
      currency: 'usd',
      status: 'succeeded', // Assuming immediate success for transfers
      payment_type: 'payout',
      payee_id: contractorId,
      payer_id: user!.id, // Admin user initiating the payout
      project_id: projectId,
    });

    if (paymentInsertError) {
      console.error('Error recording payout:', paymentInsertError.message);
      // Depending on criticality, you might want to reverse the transfer here or alert.
      return { success: false, error: 'Failed to record payout in database.' };
    }

    revalidatePath('/(admin)/dashboard'); // Revalidate admin dashboard to show updated payouts
    return { success: true, transferId: transfer.id };
  } catch (error) {
    console.error('Error creating contractor payout:', error);
    return { success: false, error: 'Failed to create contractor payout.' };
  }
}
