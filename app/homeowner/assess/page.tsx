import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { submitArAssessment } from "@/lib/actions/assessments";
import { z } from "zod";
import { assessmentSchema } from "@/lib/validations/schemas";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * AssessmentPage component allows homeowners to submit new AR assessments.
 * This page includes a form for users to input assessment details and upload files.
 *
 * @returns {JSX.Element} The rendered assessment submission page.
 */
export default async function AssessmentPage(): Promise<JSX.Element> {
  // This is a server component, so form submission will be handled by a Server Action.

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Start a New Assessment</h1>
      <p className="text-muted-foreground">
        Provide details about your home and the aging-in-place modifications you're considering.
      </p>

      <form action={submitArAssessment} className="space-y-6">
        <div>
          <Label htmlFor="homeAddress">Home Address</Label>
          <Input id="homeAddress" name="homeAddress" placeholder="123 Main St, Anytown, USA" required />
        </div>
        <div>
          <Label htmlFor="assessmentDetails">Assessment Details</Label>
          <Textarea
            id="assessmentDetails"
            name="assessmentDetails"
            placeholder="Describe the areas of your home needing modification, specific concerns, etc."
            rows={5}
            required
          />
        </div>
        <div>
          <Label htmlFor="arScanDataUrl">AR Scan Data URL (Optional)</Label>
          <Input
            id="arScanDataUrl"
            name="arScanDataUrl"
            type="url"
            placeholder="URL to AR scan data (e.g., a shared cloud link)"
          />
          <p className="text-sm text-muted-foreground mt-1">
            (Future: Integrate direct AR scan upload/capture)
          </p>
        </div>
        <Button type="submit" className="w-full">
          Submit Assessment
        </Button>
      </form>
    </div>
  );
}
