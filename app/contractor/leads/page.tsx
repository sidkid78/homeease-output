
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import LeadCard from '@/components/contractor/lead-card';
import LeadFilters from '@/components/contractor/lead-filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface LeadsPageProps {
  searchParams: {
    query?: string;
    minBudget?: string;
    maxBudget?: string;
    location?: string;
    serviceType?: string;
  };
}

export default async function ContractorLeadsPage({ searchParams }: LeadsPageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Redirecting...</div>;
  }

  let query = supabase
    .from('projects')
    .select('*, ar_assessments(*)') // Select project and related AR assessment data
    .is('contractor_id', null); // Only show leads not yet taken by a contractor

  if (searchParams.query) {
    query = query.ilike('description', `%${searchParams.query}%`); // Example search on description
  }

  if (searchParams.minBudget) {
    query = query.gte('budget', parseFloat(searchParams.minBudget));
  }

  if (searchParams.maxBudget) {
    query = query.lte('budget', parseFloat(searchParams.maxBudget));
  }

  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`);
  }

  if (searchParams.serviceType) {
    // Assuming 'homeowner_needs' or 'description' can be used for service type
    query = query.ilike('homeowner_needs', `%${searchParams.serviceType}%`);
  }

  const { data: leads, error } = await query.order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads Marketplace</h1>
        <div className="flex gap-2">
          {/* Search Input - This should also be a client component if it updates search params dynamically */}
          {/* For now, it's a static input, but ideally would be wrapped in a client component or use a Server Action to update searchParams */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leads..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              // This input would need to be a client component or connected to a search action
            />
          </div>
          <LeadFilters />
        </div>
      </div>

      {error && <p className="text-red-500">Error loading leads: {error.message}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads && leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))
        ) : (
          <p>No leads available at the moment.</p>
        )}
      </div>
    </div>
  );
}
