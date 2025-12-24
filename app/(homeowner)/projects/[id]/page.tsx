import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Json } from "@/types/database";

interface ProjectDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper to safely extract data from JSON analysis
function getAnalysisField(analysis: Json | null, field: string): string | null {
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) return null;
  const value = (analysis as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : null;
}

/**
 * ProjectDetailsPage component displays the detailed information for a specific project.
 * It fetches project data, associated assessment details, and contractor leads.
 */
export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const supabase = await createClient();
  const { id: projectId } = await params;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, ar_assessments(*), project_leads(*, contractor_profiles(*))")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    console.error("Error fetching project details:", error);
    notFound();
  }

  const assessment = project.ar_assessments;
  const projectLeads = project.project_leads;

  // Extract AI analysis data from JSON field
  const aiAnalysis = (assessment?.ai_analysis_result || assessment?.ai_analysis) ?? null;
  const analysisSummary = getAnalysisField(aiAnalysis, 'summary') || getAnalysisField(aiAnalysis, 'details');
  const recommendations = getAnalysisField(aiAnalysis, 'recommendations');
  const homeAddress = getAnalysisField(aiAnalysis, 'home_address');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project: {project.title || "Untitled Project"}</h1>
        <Badge variant="secondary">{project.status}</Badge>
      </div>

      <section className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        {homeAddress && (
          <p className="text-lg mb-2">
            <strong>Address:</strong> {homeAddress}
          </p>
        )}
        <p className="text-lg mb-2">
          <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}
        </p>
        <p className="text-lg mb-2">
          <strong>Description:</strong> {project.description || "No description provided."}
        </p>
        {project.budget_estimate && (
          <p className="text-lg mb-2">
            <strong>Budget Estimate:</strong> ${project.budget_estimate.toLocaleString()}
          </p>
        )}
      </section>

      {assessment && (
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Assessment Details</h2>
          <p className="mb-2">
            <strong>Status:</strong> <Badge variant="outline">{assessment.status}</Badge>
          </p>
          {analysisSummary && (
            <p className="mb-2">
              <strong>Analysis Summary:</strong> {analysisSummary}
            </p>
          )}
          {recommendations && (
            <p className="mb-2">
              <strong>Recommendations:</strong> {recommendations}
            </p>
          )}
          {assessment.image_url && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">Room Image</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
                <Image
                  src={assessment.image_url}
                  alt="Room Image"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            </div>
          )}
          {(assessment.visualization_url || assessment.fal_ai_visualization_url) && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">AI Visualization</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
                <Image
                  src={assessment.visualization_url || assessment.fal_ai_visualization_url || ''}
                  alt="AI Visualization"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
              {assessment.visualization_description && (
                <p className="mt-2 text-muted-foreground">{assessment.visualization_description}</p>
              )}
              <Link
                href={assessment.visualization_url || assessment.fal_ai_visualization_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-primary hover:underline"
              >
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
                <TableHead>Lead Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {lead.contractor_profiles?.company_name || "N/A"}
                    {lead.contractor_profiles?.phone_number && (
                      <span className="text-muted-foreground ml-1">
                        ({lead.contractor_profiles.phone_number})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.status === "accepted" ? "secondary" : "default"}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${lead.lead_cost.toFixed(2)}</TableCell>
                  <TableCell>
                    {lead.status === "pending" && (
                      <Button variant="outline" size="sm" className="mr-2">
                        View Offer
                      </Button>
                    )}
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
        <Link href="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    </div>
  );
}
