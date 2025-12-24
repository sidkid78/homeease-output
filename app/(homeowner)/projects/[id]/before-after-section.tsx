"use client";

import { BeforeAfterComparison } from "@/components/assessment/before-after-comparison";

interface BeforeAfterSectionProps {
    beforeImage: string;
    afterImage: string;
    modifications?: string[];
    description?: string | null;
}

export function BeforeAfterSection({
    beforeImage,
    afterImage,
    modifications,
    description
}: BeforeAfterSectionProps) {
    return (
        <BeforeAfterComparison
            beforeImage={beforeImage}
            afterImage={afterImage}
            modifications={modifications}
            description={description || undefined}
        />
    );
}
