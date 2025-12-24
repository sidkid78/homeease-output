
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface ContractorLayoutProps {
  children: React.ReactNode;
}

export default async function ContractorLayout({ children }: ContractorLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'CONTRACTOR') {
    return redirect('/dashboard'); // Redirect to appropriate dashboard if not a contractor
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/contractor-dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/leads"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Leads
          </Link>
          <Link
            href="/profile"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Profile
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/contractor-dashboard"
                className="text-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/leads"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Leads
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        {/* User menu or other header elements can go here */}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
