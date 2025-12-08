import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/database";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Define a type for a project, including its assessment
type ProjectWithAssessment = Database["public"]["Tables"]["projects"]["Row"] & {
  ar_assessments: Database["public"]["Tables"]["ar_assessments"]["Row"] | null;
};

interface ProjectCardProps {
  project: ProjectWithAssessment;
}

/**
 * ProjectCard component displays a summary of a single project.
 * It provides a quick overview and a link to the project details page.
 *
 * @param {ProjectCardProps} props - The props for the ProjectCard component.
 * @param {ProjectWithAssessment} props.project - The project data to display.
 * @returns {JSX.Element} The rendered project card.
 */
export default function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{project.title || "Untitled Project"}</CardTitle>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {project.home_address}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">
          {project.description || project.ar_assessments?.analysis_summary || "No description available."}
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          Created: {new Date(project.created_at).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
