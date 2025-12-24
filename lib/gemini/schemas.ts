/**
 * Gemini API Schema Definitions
 * 
 * These schemas are used for structured output from Gemini.
 * They match the TypeScript types in ../types/gemini.ts
 */

import { Type, Schema } from "@google/genai";

// ============================================================================
// Component Schemas
// ============================================================================

export const modificationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "Name of the modification (e.g., 'Grab Bar Installation')"
        },
        category: {
            type: Type.STRING,
            description: "Category: grab_bars, ramps, lighting, flooring, door_widening, lever_handles, raised_toilet, walk_in_shower, stair_lift, handrails, non_slip_surfaces, smart_home, seating, storage, other"
        },
        priority: {
            type: Type.STRING,
            enum: ["critical", "high", "medium", "low"],
            description: "Priority level - critical for safety hazards, high for important improvements"
        },
        description: {
            type: Type.STRING,
            description: "Detailed description of the modification and why it's needed"
        },
        location: {
            type: Type.STRING,
            description: "Specific location in the room (e.g., 'left side of bathtub at 36 inches height')"
        },
        estimated_cost_range: {
            type: Type.STRING,
            description: "Estimated cost range (e.g., '$200-$500')"
        },
        diy_possible: {
            type: Type.BOOLEAN,
            description: "Whether this can be a DIY project for someone handy"
        },
        contractor_type: {
            type: Type.STRING,
            description: "Type of contractor needed if not DIY (e.g., 'plumber', 'electrician', 'general contractor')"
        },
        safety_impact: {
            type: Type.STRING,
            description: "How this modification improves safety"
        },
        independence_impact: {
            type: Type.STRING,
            description: "How this modification improves independence and quality of life"
        },
    },
    required: [
        "name",
        "category",
        "priority",
        "description",
        "location",
        "estimated_cost_range",
        "diy_possible",
        "contractor_type",
        "safety_impact",
        "independence_impact"
    ],
};

export const safetyHazardSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        hazard: {
            type: Type.STRING,
            description: "Clear description of the safety hazard"
        },
        location: {
            type: Type.STRING,
            description: "Exact location of the hazard in the room"
        },
        severity: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
            description: "Severity level - high means immediate risk of injury"
        },
        immediate_action: {
            type: Type.STRING,
            description: "Recommended immediate action to mitigate the hazard"
        },
    },
    required: ["hazard", "location", "severity", "immediate_action"],
};

// ============================================================================
// Main Analysis Schema
// ============================================================================

export const roomAnalysisSchema: Schema = {
    type: Type.OBJECT,
    description: "Complete aging-in-place assessment for a room",
    properties: {
        room_type: {
            type: Type.STRING,
            description: "Type of room analyzed"
        },
        accessibility_score: {
            type: Type.INTEGER,
            description: "Accessibility score from 1 (poor) to 10 (excellent)"
        },
        summary: {
            type: Type.STRING,
            description: "Brief 2-3 sentence summary of key findings and recommendations"
        },
        safety_hazards: {
            type: Type.ARRAY,
            items: safetyHazardSchema,
            description: "List of identified safety hazards that need attention"
        },
        modifications: {
            type: Type.ARRAY,
            items: modificationSchema,
            description: "List of recommended modifications in priority order"
        },
        positive_features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Existing features that already support aging-in-place"
        },
        estimated_total_cost: {
            type: Type.STRING,
            description: "Total estimated cost range for all modifications (e.g., '$2,000-$5,000')"
        },
        priority_order: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Names of modifications in recommended priority order"
        },
    },
    required: [
        "room_type",
        "accessibility_score",
        "summary",
        "safety_hazards",
        "modifications",
        "positive_features",
        "estimated_total_cost",
        "priority_order"
    ],
};