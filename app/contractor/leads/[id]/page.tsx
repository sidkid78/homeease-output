
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const supabase = createClient();

  const [lead, setLead] = useState<Database['public']['Tables']['projects']['Row'] | null>(null);
  const [arAssessment, setArAssessment] = useState<Database['public']['Tables']['ar_assessments']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [user, setUser] = useState<any>(null); // Supabase user type

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
        setArAssessment(leadData.ar_assessments);
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
      // In a real application, this would involve a Stripe payment and then updating the project.
      // For this example, we'll directly assign the contractor_id.
      const { data, error } = await supabase
        .from('projects')
        .update({ contractor_id: user.id })
        .eq('id', leadId)
        .select(); // Select the updated row

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        toast.success('Lead purchased successfully!');
        router.push('/contractor/dashboard'); // Redirect to dashboard or purchased leads list
      } else {
        toast.error('Failed to purchase lead: No data returned.');
      }
    } catch (error: any) {
      console.error('Error purchasing lead:', error);
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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{lead.project_name}</CardTitle>
          <CardDescription>{lead.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="font-semibold">Homeowner Needs:</h3>
            <p>{lead.homeowner_needs || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Location:</h3>
            <p>{lead.location || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Budget:</h3>
            <p>{lead.budget ? `$${lead.budget.toLocaleString()}` : 'N/A'}</p>
          </div>
          {arAssessment && (
            <div className="grid gap-2">
              <h3 className="font-semibold">AR Assessment Details:</h3>
              <p><strong>AI Analysis:</strong> {arAssessment.ai_analysis || 'N/A'}</p>
              <p><strong>Visualizations:</strong> {arAssessment.visualization_url ? <a href={arAssessment.visualization_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Visualization</a> : 'N/A'}</p>
              <p><strong>Recommendations:</strong> {arAssessment.recommendations || 'N/A'}</p>
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
          <CardDescription>Manage this lead</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {lead.contractor_id === user?.id ? (
            <Button disabled>Lead Already Purchased</Button>
          ) : (
            <Button onClick={handlePurchaseLead} disabled={purchasing}>
              {purchasing ? 'Purchasing...' : 'Purchase Lead'}
            </Button>
          )}
          {/* Potentially add "Contact Homeowner" button here after purchase */}
          {lead.contractor_id && lead.contractor_id !== user?.id && (
             <p className="text-sm text-red-500">This lead has been acquired by another contractor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
