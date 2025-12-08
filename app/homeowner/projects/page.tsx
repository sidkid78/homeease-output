import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/homeowner/project-card";
import { Database } from "@/types/database";

/**
 * ProjectsPage component displays a list of all projects for the logged-in homeowner.
 * It fetches project data and renders them using ProjectCard components.
 *
 * @returns {Promise<JSX.Element>} The rendered homeowner projects page.
 */
export default async function ProjectsPage(): Promise<JSX.Element> {
  const supabase = createClient<Database>();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, ar_assessments(*)") // Eager load related assessment data
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return <p className="text-red-500">Error loading projects.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Projects</h1>

      <section>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You haven't started any projects yet. Go to "New Assessment" to begin!</p>
        )}
      </section>
    </div>
  );
}
