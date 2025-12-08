
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export default async function ContractorDashboardPage() {
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
    // This should ideally be handled by the layout redirect, but added for robustness
    return <div>Redirecting...</div>;
  }

  // Fetch some contractor-specific data for the dashboard
  // Example: Number of purchased leads, ongoing projects, etc.
  const { data: purchasedLeadsCount, error: leadsError } = await supabase
    .from('project_leads')
    .select('id', { count: 'exact' })
    .eq('contractor_id', user.id);

  const { data: totalLeadsAvailable, error: totalLeadsError } = await supabase
    .from('projects')
    .select('id', { count: 'exact' })
    .is('contractor_id', null); // Leads not yet assigned to a contractor

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Purchased Leads</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87m-3-12a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{purchasedLeadsCount?.count || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total leads you&apos;ve acquired.
          </p>
          {leadsError && <p className="text-red-500 text-xs mt-1">{leadsError.message}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Leads</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeadsAvailable?.count || 0}</div>
          <p className="text-xs text-muted-foreground">
            New leads waiting in the marketplace.
          </p>
          {totalLeadsError && <p className="text-red-500 text-xs mt-1">{totalLeadsError.message}</p>}
        </CardContent>
      </Card>
      {/* Additional cards for other contractor-specific metrics can be added here */}
    </div>
  );
}
