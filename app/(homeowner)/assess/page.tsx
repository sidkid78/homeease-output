import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { submitArAssessment } from "@/lib/actions/assessments";
import { AssessmentForm } from "@/components/assessment/assessment-form";

/**
 * AssessmentPage component allows homeowners to submit new AR assessments.
 * This page includes a form for users to input assessment details and upload images.
 */
export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient">Start a New Assessment</h1>
        <p className="text-muted-foreground">
          Upload a photo of your room and describe your aging-in-place needs.
          Our AI will analyze the space and suggest modifications.
        </p>
      </div>

      <AssessmentForm userId={user.id} onSubmit={submitArAssessment} />
    </div>
  );
}
