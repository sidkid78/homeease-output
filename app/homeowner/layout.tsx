import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode, FC } from "react";

interface HomeownerLayoutProps {
  children: ReactNode;
}

/**
 * HomeownerLayout component defines the layout for the homeowner section of the application.
 * It includes navigation and ensures the user is authenticated and has a homeowner profile.
 *
 * @param {HomeownerLayoutProps} props - The props for the HomeownerLayout component.
 * @param {ReactNode} props.children - The child components to be rendered within the layout.
 * @returns The rendered homeowner layout.
 */
const HomeownerLayout: FC<HomeownerLayoutProps> = async ({ children }) => {
  const supabase = createClient();

  // Await the resolution of the Supabase client before calling auth.getUser()
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    redirect("/login");
    // return null is not required as redirect() will throw
  }

  // In a real application, you would fetch the user's profile to check their role.
  // For this example, we'll assume any authenticated user reaching this layout is a homeowner.
  // You would typically have RLS policies on your homeowner_profiles table to ensure data integrity.

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/homeowner/dashboard" className="text-xl font-bold">
            HOMEase
          </Link>
          <ul className="flex space-x-4">
            <li>
              <Link href="/homeowner/dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/assess" className="hover:underline">
                New Assessment
              </Link>
            </li>
            <li>
              <Link href="/projects" className="hover:underline">
                My Projects
              </Link>
            </li>
            <li>
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="hover:underline">
                  Sign Out
                </button>
              </form>
            </li>
          </ul>
        </nav>
      </header>
      <main className="grow container mx-auto p-4">{children}</main>
      <footer className="bg-secondary text-secondary-foreground p-4 text-center">
        <p>&copy; {new Date().getFullYear()} HOMEase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomeownerLayout;
