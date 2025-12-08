import { createClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/homeowner/dashboard-stats";
import ProjectCard from "@/components/homeowner/project-card";
import { Database } from "@/types/database";

/**
 * The DashboardPage component displays an overview for the homeowner.
 * It fetches the homeowner's projects and displays key statistics and project cards.
 *
 * @returns {Promise<JSX.Element>} The rendered homeowner dashboard page.
 */
export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createClient();

  // Fetch homeowner's projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, ar_assessments(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    // In a production app, you would show a more user-friendly error message
    return <p className="text-red-500">Error loading dashboard data.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Homeowner Dashboard</h1>

      <DashboardStats projectCount={projects?.length || 0} />

      <section>
        <h2 className="text-2xl font-semibold mb-4">My Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No projects found. Start a new assessment to create one!</p>
        )}
      </section>
    </div>
  );
}
