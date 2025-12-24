/**
 * HOMEase Gemini AI Service
 * 
 * Provides room analysis and visualization using Google's Gemini API.
 * 
 * Models used:
 * - gemini-2.5-flash: Room analysis with structured output
 * - gemini-2.5-flash-preview-image-generation: "After" visualization generation (chat mode)
 * 
 * @example
 * ```typescript
 * import { geminiService } from '@/lib/gemini'
 * 
 * // Analyze a room
 * const analysis = await geminiService.analyzeRoom(imageBase64, 'bathroom', ['balance_issues'])
 * 
 * // Generate visualization
 * const vizImage = await geminiService.generateVisualization(imageBase64, ['grab bars', 'non-slip mat'])
 * ```
 */

import { GoogleGenAI } from "@google/genai";
import { roomAnalysisSchema } from "./schemas";
import {
    RoomAnalysis,
    AnalysisRequest,
    MobilityConcern
} from "@/types/gemini";

// ============================================================================
// Constants
// ============================================================================

const ANALYSIS_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-preview-image-generation";

// Default concerns if none specified
const DEFAULT_CONCERNS: MobilityConcern[] = [MobilityConcern.GENERAL_AGING];

// ============================================================================
// Prompt Templates
// ============================================================================

function buildAnalysisPrompt(
    roomType: string,
    concerns: string[],
    homeownerAge?: number,
    budgetRange?: string,
    additionalContext?: string
): string {
    let prompt = `You are an expert aging-in-place home modification consultant. Analyze this ${roomType} image and provide detailed recommendations for modifications that will improve safety, accessibility, and independence for aging residents.

## Context
- Room Type: ${roomType}
- Mobility/Accessibility Concerns: ${concerns.join(', ')}`;

    if (homeownerAge) {
        prompt += `\n- Homeowner Age: ${homeownerAge} years old`;
    }

    if (budgetRange) {
        prompt += `\n- Budget Range: ${budgetRange}`;
    }

    if (additionalContext) {
        prompt += `\n- Additional Context: ${additionalContext}`;
    }

    prompt += `

## Your Task
Carefully examine the image and provide:

1. **Safety Hazards**: Identify any immediate safety concerns (trip hazards, lack of support, poor lighting, etc.)

2. **Recommended Modifications**: For each modification, consider:
   - Specific location in the room
   - Priority level (critical for safety hazards, high for important improvements)
   - Realistic cost estimates based on current market rates
   - Whether it can be DIY or needs a contractor
   - Impact on safety and independence

3. **Positive Features**: Note any existing features that already support aging-in-place

4. **Overall Assessment**: Provide an accessibility score (1-10) and prioritized action plan

## Important Guidelines
- Be specific about locations (e.g., "left side of bathtub" not just "bathtub")
- Consider the actual layout shown in the image
- Provide realistic cost ranges based on current market rates
- Prioritize safety-critical items first
- Consider the specific mobility concerns mentioned
- Recommend professional installation for electrical, plumbing, or structural work

Analyze the image now and provide your detailed assessment.`;

    return prompt;
}

function buildVisualizationPrompt(modifications: string[]): string {
    const modificationsList = modifications.map(m => `- ${m}`).join('\n');

    return `Edit this room image to show the following aging-in-place modifications professionally installed:

${modificationsList}

## Requirements
- Keep the EXACT same room layout, camera angle, perspective, and lighting
- Add the modifications in realistic, appropriate locations
- Make it photorealistic - this should look like a real "after" photo
- Modifications should look professionally installed
- Maintain the room's existing color scheme and aesthetic

## Specific Standards
- Grab bars: Stainless steel or chrome, mounted at 33-36 inches height
- Non-slip surfaces: Subtle texture change, realistic appearance  
- Handrails: Wood or metal, proper height with secure wall mounting
- Walk-in features: Realistic tile/glass materials

Generate the modified room image now.`;
}

// ============================================================================
// Service Class
// ============================================================================

export class GeminiService {
    private client: GoogleGenAI;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;

        if (!key) {
            throw new Error(
                "Gemini API key not found. Set GEMINI_API_KEY or API_KEY environment variable."
            );
        }

        this.client = new GoogleGenAI({ apiKey: key });
    }

    /**
     * Analyze a room image for aging-in-place modifications.
     * 
     * @param imageBase64 - Base64 encoded image (without data URL prefix)
     * @param roomType - Type of room (bathroom, bedroom, etc.)
     * @param concerns - List of mobility/accessibility concerns
     * @param options - Additional options (homeownerAge, budgetRange, etc.)
     * @returns Structured room analysis
     */
    async analyzeRoom(
        imageBase64: string,
        roomType: string,
        concerns: string[] = [],
        options: {
            homeownerAge?: number;
            budgetRange?: string;
            additionalContext?: string;
        } = {}
    ): Promise<RoomAnalysis> {
        const effectiveConcerns = concerns.length > 0 ? concerns : DEFAULT_CONCERNS;

        const prompt = buildAnalysisPrompt(
            roomType,
            effectiveConcerns,
            options.homeownerAge,
            options.budgetRange,
            options.additionalContext
        );

        try {
            const response = await this.client.models.generateContent({
                model: ANALYSIS_MODEL,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageBase64,
                            },
                        },
                        { text: prompt },
                    ],
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: roomAnalysisSchema,
                    temperature: 0.3, // Lower for consistent, reliable analysis
                },
            });

            if (!response.text) {
                throw new Error("No response received from Gemini analysis.");
            }

            const analysis = JSON.parse(response.text) as RoomAnalysis;

            // Ensure room_type is set
            if (!analysis.room_type) {
                analysis.room_type = roomType;
            }

            return analysis;

        } catch (error) {
            console.error("[GeminiService] Analysis failed:", error);

            if (error instanceof SyntaxError) {
                throw new Error("Failed to parse analysis response. Please try again.");
            }

            throw error;
        }
    }

    /**
     * Generate a visualization showing proposed modifications.
     * 
     * Uses gemini-2.5-flash-preview-image-generation in CHAT MODE
     * for best image editing results (recommended approach).
     * 
     * @param originalImageBase64 - Base64 encoded original room image
     * @param modifications - List of modifications to visualize
     * @returns Base64 encoded generated image(s) and description
     */
    async generateVisualization(
        originalImageBase64: string,
        modifications: string[]
    ): Promise<{ imageBase64: string; allImages?: string[]; description?: string }> {
        if (modifications.length === 0) {
            throw new Error("At least one modification must be specified.");
        }

        const prompt = buildVisualizationPrompt(modifications);

        try {
            // Use CHAT MODE for image editing (recommended by Gemini docs)
            const chat = this.client.chats.create({
                model: IMAGE_MODEL,
            });

            // Send the image and prompt together
            const response = await chat.sendMessage([
                prompt,
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: originalImageBase64,
                    },
                },
            ]);

            // Extract all images and text from response
            const images: string[] = [];
            let description: string | undefined;

            const candidates = response.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content?.parts || [];

                for (const part of parts) {
                    if (part.inlineData?.data) {
                        images.push(part.inlineData.data);
                    }
                    if (part.text) {
                        description = part.text;
                    }
                }
            }

            if (images.length === 0) {
                throw new Error(
                    "No image generated. The model may have refused the request or encountered an error."
                );
            }

            return {
                imageBase64: images[0],        // Primary image
                allImages: images,              // All generated images
                description
            };

        } catch (error) {
            console.error("[GeminiService] Visualization failed:", error);
            throw error;
        }
    }

    /**
     * Interactive visualization session using chat.
     * Allows iterative refinement of the visualization.
     * 
     * @param originalImageBase64 - Base64 encoded original room image
     * @returns Chat session object for iterative editing
     */
    createVisualizationSession(originalImageBase64: string) {
        const chat = this.client.chats.create({
            model: IMAGE_MODEL,
        });

        return {
            /**
             * Apply initial modifications
             */
            applyModifications: async (modifications: string[]) => {
                const prompt = buildVisualizationPrompt(modifications);

                const response = await chat.sendMessage([
                    prompt,
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: originalImageBase64,
                        },
                    },
                ]);

                return this.extractImagesFromResponse(response);
            },

            /**
             * Refine the visualization with additional instructions
             */
            refine: async (instruction: string) => {
                const response = await chat.sendMessage(instruction);
                return this.extractImagesFromResponse(response);
            },

            /**
             * Get chat history
             */
            getHistory: () => chat.getHistory(),
        };
    }

    /**
     * Extract images from a Gemini response
     */
    private extractImagesFromResponse(response: any): {
        imageBase64: string;
        allImages: string[];
        description?: string;
    } {
        const images: string[] = [];
        let description: string | undefined;

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content?.parts || [];

            for (const part of parts) {
                if (part.inlineData?.data) {
                    images.push(part.inlineData.data);
                }
                if (part.text) {
                    description = part.text;
                }
            }
        }

        if (images.length === 0) {
            throw new Error("No image in response");
        }

        return {
            imageBase64: images[0],
            allImages: images,
            description,
        };
    }

    /**
     * Combined analysis and visualization in one call.
     * 
     * Analyzes the room first, then generates a visualization
     * of the top N recommended modifications.
     * 
     * @param request - Analysis request with image and context
     * @param visualizeTopN - Number of top modifications to visualize (default: 3)
     * @returns Analysis result and visualization image
     */
    async analyzeAndVisualize(
        request: AnalysisRequest,
        visualizeTopN: number = 3
    ): Promise<{
        analysis: RoomAnalysis;
        visualization?: { imageBase64: string; allImages?: string[]; description?: string };
    }> {
        // Step 1: Analyze
        const analysis = await this.analyzeRoom(
            request.imageBase64,
            request.roomType as string,
            request.concerns as string[],
            {
                homeownerAge: request.homeownerAge,
                budgetRange: request.budgetRange,
                additionalContext: request.additionalContext,
            }
        );

        // Step 2: Visualize top modifications
        let visualization: { imageBase64: string; allImages?: string[]; description?: string } | undefined;

        if (analysis.modifications.length > 0) {
            const topMods = analysis.modifications
                .slice(0, visualizeTopN)
                .map(m => m.name);

            try {
                visualization = await this.generateVisualization(
                    request.imageBase64,
                    topMods
                );
            } catch (vizError) {
                console.warn("[GeminiService] Visualization failed, returning analysis only:", vizError);
                // Don't fail the whole request if visualization fails
            }
        }

        return { analysis, visualization };
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

// Lazy initialization to avoid issues during build
let _geminiService: GeminiService | null = null;

export function getGeminiService(): GeminiService {
    if (!_geminiService) {
        _geminiService = new GeminiService();
    }
    return _geminiService;
}

// For convenience, but be careful with this in edge environments
export const geminiService = {
    analyzeRoom: (...args: Parameters<GeminiService['analyzeRoom']>) =>
        getGeminiService().analyzeRoom(...args),
    generateVisualization: (...args: Parameters<GeminiService['generateVisualization']>) =>
        getGeminiService().generateVisualization(...args),
    analyzeAndVisualize: (...args: Parameters<GeminiService['analyzeAndVisualize']>) =>
        getGeminiService().analyzeAndVisualize(...args),
    createVisualizationSession: (...args: Parameters<GeminiService['createVisualizationSession']>) =>
        getGeminiService().createVisualizationSession(...args),
};
