import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Json } from "@/types/database";
import { BeforeAfterSection } from "./before-after-section";
import { 
    CheckCircle2, 
    AlertTriangle, 
    Sparkles,
    MapPin,
    Calendar,
    DollarSign,
    ArrowLeft
} from "lucide-react";

interface ProjectDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Helper to safely extract data from JSON analysis
function getAnalysisData(analysis: Json | null): {
    summary?: string;
    recommendations?: string;
    homeAddress?: string;
    roomType?: string;
    accessibilityScore?: number;
    modifications?: Array<{
        name: string;
        description: string;
        priority: string;
        estimated_cost_range?: string;
        location?: string;
        diy_possible?: boolean;
    }>;
    safetyHazards?: string[];
    positiveFeatures?: string[];
    estimatedTotalCost?: string;
} {
    if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
        return {};
    }
    
    const data = analysis as Record<string, unknown>;
    
    return {
        summary: typeof data.summary === 'string' ? data.summary : 
                 typeof data.details === 'string' ? data.details : undefined,
        recommendations: typeof data.recommendations === 'string' ? data.recommendations : undefined,
        homeAddress: typeof data.home_address === 'string' ? data.home_address : undefined,
        roomType: typeof data.room_type === 'string' ? data.room_type : undefined,
        accessibilityScore: typeof data.accessibility_score === 'number' ? data.accessibility_score : undefined,
        modifications: Array.isArray(data.modifications) ? data.modifications : undefined,
        safetyHazards: Array.isArray(data.safety_hazards) ? data.safety_hazards : undefined,
        positiveFeatures: Array.isArray(data.positive_features) ? data.positive_features : undefined,
        estimatedTotalCost: typeof data.estimated_total_cost === 'string' ? data.estimated_total_cost : undefined,
    };
}

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

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
    const aiAnalysis = getAnalysisData(assessment?.ai_analysis || assessment?.ai_analysis_result);
    const beforeImageUrl = assessment?.image_url;
    const afterImageUrl = assessment?.visualization_url || assessment?.fal_ai_visualization_url;
    const visualizationDescription = assessment?.visualization_description;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Link 
                        href="/projects" 
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold">{project.title || "Untitled Project"}</h1>
                    {aiAnalysis.homeAddress && (
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {aiAnalysis.homeAddress}
                        </p>
                    )}
                </div>
                <Badge 
                    variant={project.status === 'visualized' ? 'default' : 'secondary'}
                    className="text-sm px-3 py-1"
                >
                    {project.status}
                </Badge>
            </div>

            {/* Accessibility Score Banner */}
            {aiAnalysis.accessibilityScore !== undefined && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Accessibility Score</h3>
                                <p className="text-muted-foreground text-sm">
                                    Based on AI safety and accessibility analysis
                                </p>
                            </div>
                            <div className="text-5xl font-bold text-primary">
                                {aiAnalysis.accessibilityScore}<span className="text-2xl">/10</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Before/After Comparison - THE MAIN FEATURE */}
            {beforeImageUrl && afterImageUrl && (
                <BeforeAfterSection
                    beforeImage={beforeImageUrl}
                    afterImage={afterImageUrl}
                    modifications={aiAnalysis.modifications?.slice(0, 5).map(m => m.name)}
                    description={visualizationDescription}
                />
            )}

            {/* If no visualization yet, show just the original image */}
            {beforeImageUrl && !afterImageUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle>Room Photo</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            AI visualization is being generated...
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full h-80 rounded-lg overflow-hidden">
                            <Image
                                src={beforeImageUrl}
                                alt="Room Photo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary */}
            {aiAnalysis.summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Assessment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{aiAnalysis.summary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Safety Hazards */}
            {aiAnalysis.safetyHazards && aiAnalysis.safetyHazards.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            Safety Hazards Identified
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {aiAnalysis.safetyHazards.map((hazard, i) => (
                                <li key={i} className="flex items-start gap-2 text-red-700">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                    {hazard}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Recommended Modifications */}
            {aiAnalysis.modifications && aiAnalysis.modifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recommended Modifications</CardTitle>
                        {aiAnalysis.estimatedTotalCost && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Estimated Total: {aiAnalysis.estimatedTotalCost}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiAnalysis.modifications.map((mod, i) => (
                                <div key={i} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-lg">{mod.name}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(mod.priority)}`}>
                                            {mod.priority}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">{mod.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm pt-2">
                                        {mod.location && (
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {mod.location}
                                            </span>
                                        )}
                                        {mod.estimated_cost_range && (
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {mod.estimated_cost_range}
                                            </span>
                                        )}
                                        {mod.diy_possible !== undefined && (
                                            <span className={`${mod.diy_possible ? 'text-green-600' : 'text-orange-600'}`}>
                                                {mod.diy_possible ? '🔧 DIY Possible' : '👷 Professional Recommended'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Positive Features */}
            {aiAnalysis.positiveFeatures && aiAnalysis.positiveFeatures.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="h-5 w-5" />
                            Existing Positive Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {aiAnalysis.positiveFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-green-700">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Project Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created: {new Date(project.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                    {project.budget_estimate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Budget Estimate: ${project.budget_estimate.toLocaleString()}
                        </div>
                    )}
                    {project.description && (
                        <p className="text-muted-foreground pt-2">{project.description}</p>
                    )}
                </CardContent>
            </Card>

            {/* Contractor Leads */}
            <Card>
                <CardHeader>
                    <CardTitle>Contractor Leads</CardTitle>
                </CardHeader>
                <CardContent>
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
                                            <div>
                                                <p className="font-medium">
                                                    {lead.contractor_profiles?.company_name || "N/A"}
                                                </p>
                                                {lead.contractor_profiles?.phone_number && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {lead.contractor_profiles.phone_number}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={lead.status === "accepted" ? "default" : "secondary"}>
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${lead.lead_cost.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {lead.status === "pending" && (
                                                <Button variant="outline" size="sm">
                                                    View Offer
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No contractor leads for this project yet. We'll notify local contractors about your project.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Link href="/projects">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                    </Button>
                </Link>
                <Link href="/assess">
                    <Button>
                        <Sparkles className="h-4 w-4 mr-2" />
                        New Assessment
                    </Button>
                </Link>
            </div>
        </div>
    );
}
