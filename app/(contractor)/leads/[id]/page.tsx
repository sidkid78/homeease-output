'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/lib/actions/payments';

// Lead cost in cents (default to $40)
const DEFAULT_LEAD_COST_CENTS = 4000;

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const supabase = createClient();

  const [lead, setLead] = useState<Database['public']['Tables']['projects']['Row'] | null>(null);
  const [arAssessment, setArAssessment] = useState<Database['public']['Tables']['ar_assessments']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check for payment success/failure from URL params
  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
      toast.success('Payment successful! Lead purchased.');
    }
    if (searchParams.get('payment_cancelled') === 'true') {
      toast.error('Payment was cancelled.');
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchLeadAndUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!leadId) {
        setLoading(false);
        return;
      }

      const { data: leadData, error: leadError } = await supabase
        .from('projects')
        .select('*, ar_assessments(*)')
        .eq('id', leadId)
        .single();

      if (leadError) {
        console.error('Error fetching lead:', leadError);
        toast.error('Failed to load lead details.');
        setLoading(false);
        return;
      }

      setLead(leadData);
      if (leadData?.ar_assessments) {
        setArAssessment(leadData.ar_assessments as Database['public']['Tables']['ar_assessments']['Row']);
      }
      setLoading(false);
    }
    fetchLeadAndUser();
  }, [leadId, supabase]);

  const handlePurchaseLead = async () => {
    if (!user || !leadId) {
      toast.error('You must be logged in to purchase a lead.');
      return;
    }

    setPurchasing(true);
    try {
      // Create a Stripe Checkout session
      const result = await createCheckoutSession({
        leadId: leadId,
        priceInCents: DEFAULT_LEAD_COST_CENTS, // $40 per lead
        contractorId: user.id,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to create checkout session.');
        return;
      }

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        toast.error('No checkout URL returned.');
      }
    } catch (error: any) {
      console.error('Error initiating lead purchase:', error);
      toast.error(`Failed to purchase lead: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="text-center py-8 text-red-500">Lead not found.</div>;
  }

  // Check if already purchased (via project_leads table, status = 'purchased')
  const isPurchased = lead.status === 'purchased' || searchParams.get('payment_success') === 'true';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{lead.title}</CardTitle>
          <CardDescription>{lead.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="font-semibold">Project Details:</h3>
            <p>{lead.description || 'No description provided.'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Budget Estimate:</h3>
            <p>{lead.budget_estimate ? `$${lead.budget_estimate.toLocaleString()}` : 'Not specified'}</p>
          </div>
          {arAssessment && (
            <div className="grid gap-2">
              <h3 className="font-semibold">AR Assessment Details:</h3>
              <p><strong>Status:</strong> {arAssessment.status}</p>
              {arAssessment.fal_ai_visualization_url && (
                <p>
                  <strong>Visualization:</strong>{' '}
                  <a
                    href={arAssessment.fal_ai_visualization_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Visualization
                  </a>
                </p>
              )}
            </div>
          )}
          {lead.status && (
            <div>
              <h3 className="font-semibold">Status:</h3>
              <Badge variant="secondary">{lead.status}</Badge>
            </div>
          )}
          {lead.created_at && (
            <div>
              <h3 className="font-semibold">Created:</h3>
              <p>{new Date(lead.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Actions</CardTitle>
          <CardDescription>Purchase this lead to access full details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-2xl font-bold text-green-600">
            ${(DEFAULT_LEAD_COST_CENTS / 100).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            Get full access to homeowner contact information and project details.
          </p>

          {isPurchased ? (
            <Button disabled className="w-full">
              ✓ Lead Purchased
            </Button>
          ) : (
            <Button
              onClick={handlePurchaseLead}
              disabled={purchasing}
              className="w-full"
            >
              {purchasing ? 'Redirecting to Checkout...' : 'Purchase Lead'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
