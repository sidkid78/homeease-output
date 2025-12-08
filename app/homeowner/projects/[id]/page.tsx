import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProjectDetailsPageProps {
  params: {
    id: string;
  };
}

/**
 * ProjectDetailsPage component displays the detailed information for a specific project.
 * It fetches project data, associated assessment details, and contractor leads.
 *
 * @param {ProjectDetailsPageProps} props - The props for the ProjectDetailsPage component.
 * @param {Object} props.params - The route parameters.
 * @param {string} props.params.id - The ID of the project to display.
 * @returns {Promise<JSX.Element>} The rendered project details page.
 */
export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps): Promise<JSX.Element> {
  const supabase = createClient<Database>();
  const projectId = params.id;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, ar_assessments(*), project_leads(*, contractor_profiles(*))") // Eager load all related data
    .eq("id", projectId)
    .single();

  if (error || !project) {
    console.error("Error fetching project details:", error);
    notFound(); // Display a 404 page if project not found
  }

  const assessment = project.ar_assessments;
  const projectLeads = project.project_leads;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project: {project.title || "Untitled Project"}</h1>
        <Badge variant="secondary">{project.status}</Badge>
      </div>

      <section className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <p className="text-lg mb-2">
          <strong>Address:</strong> {project.home_address}
        </p>
        <p className="text-lg mb-2">
          <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}
        </p>
        <p className="text-lg mb-2">
          <strong>Description:</strong> {project.description || "No description provided."}
        </p>
      </section>

      {assessment && (
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Assessment Details</h2>
          <p className="mb-2">
            <strong>Analysis Summary:</strong> {assessment.analysis_summary || "N/A"}
          </p>
          <p className="mb-2">
            <strong>Recommendations:</strong> {assessment.recommendations || "N/A"}
          </p>
          {assessment.ar_scan_data_url && (
            <div>
              <p className="mb-2">
                <strong>AR Scan Data:</strong>{" "}
                <Link href={assessment.ar_scan_data_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  View Scan Data
                </Link>
              </p>
            </div>
          )}
          {assessment.fal_ai_visualization_url && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">AI Visualization</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
                <Image
                  src={assessment.fal_ai_visualization_url}
                  alt="AI Visualization"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <Link href={assessment.fal_ai_visualization_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-primary hover:underline">
                Open Visualization in New Tab
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Contractor Leads</h2>
        {projectLeads && projectLeads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contractor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {lead.contractor_profiles?.company_name || "N/A"} (
                    {lead.contractor_profiles?.contact_email || "N/A"})
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.status === "accepted" ? "success" : "default"}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>${lead.lead_price ? lead.lead_price.toFixed(2) : "0.00"}</TableCell>
                  <TableCell>
                    {lead.status === "pending" && (
                      <Button variant="outline" size="sm" className="mr-2">
                        View Offer
                      </Button>
                    )}
                    {/* Add more actions like "Message Contractor", "Accept Offer", etc. */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No contractor leads for this project yet.</p>
        )}
      </section>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
        {/* Add more project actions here, e.g., "Request more bids", "Mark as complete" */}
      </div>
    </div>
  );
}
