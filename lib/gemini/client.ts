/**
 * HOMEase Gemini AI Service
 * 
 * Provides room analysis and visualization using Google's Gemini API.
 * 
 * Models used:
 * - gemini-2.5-flash: Room analysis with structured output
 * - gemini-2.5-flash-preview-image-generation: "After" visualization generation
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

import { GoogleGenAI, Type } from "@google/genai";
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
const IMAGE_MODEL = "gemini-2.5-flash-image-preview";

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
        const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!key) {
            throw new Error(
                "Gemini API key not found. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable."
            );
        }

        this.client = new GoogleGenAI({ apiKey: key });
    }

    /**
     * Analyze a room image for aging-in-place modifications.
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
            console.log('[GeminiService] Starting room analysis...');
            
            const response = await this.client.models.generateContent({
                model: ANALYSIS_MODEL,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: imageBase64,
                                },
                            },
                            { text: prompt },
                        ],
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: roomAnalysisSchema,
                    temperature: 0.3,
                },
            });

            const text = response.text;
            if (!text) {
                throw new Error("No response received from Gemini analysis.");
            }

            console.log('[GeminiService] Analysis complete, parsing response...');
            const analysis = JSON.parse(text) as RoomAnalysis;

            if (!analysis.room_type) {
                analysis.room_type = roomType;
            }

            console.log('[GeminiService] Found', analysis.modifications?.length || 0, 'modifications');
            return analysis;

        } catch (error) {
            console.error("[GeminiService] Analysis failed:", error);
            throw error;
        }
    }

    /**
     * Generate a visualization showing proposed modifications.
     * 
     * Uses Gemini's native image generation to create an "after" image.
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
            console.log('[GeminiService] Starting visualization generation...');
            console.log('[GeminiService] Modifications:', modifications);

            // Use chat mode for image editing (recommended approach)
            const chat = this.client.chats.create({
                model: IMAGE_MODEL,
                config: {
                    responseModalities: ['image', 'text'],
                }
            });

            // Send the image and prompt together
            const response = await chat.sendMessage([
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: originalImageBase64,
                    },
                },
                { text: prompt },
            ]);

            // Extract images and text from response
            const images: string[] = [];
            let description: string | undefined;

            if (response.candidates && response.candidates.length > 0) {
                const parts = response.candidates[0].content?.parts || [];

                for (const part of parts) {
                    if (part.inlineData?.data) {
                        images.push(part.inlineData.data);
                        console.log('[GeminiService] Got image in response');
                    }
                    if (part.text) {
                        description = part.text;
                        console.log('[GeminiService] Got description:', part.text.substring(0, 100));
                    }
                }
            }

            if (images.length === 0) {
                console.error('[GeminiService] No images in response. Full response:', JSON.stringify(response, null, 2));
                throw new Error("No image generated. The model may have refused or encountered an error.");
            }

            console.log('[GeminiService] Visualization complete, got', images.length, 'images');

            return {
                imageBase64: images[0],
                allImages: images,
                description
            };

        } catch (error) {
            console.error("[GeminiService] Visualization failed:", error);
            throw error;
        }
    }

    /**
     * Combined analysis and visualization in one call.
     */
    async analyzeAndVisualize(
        request: AnalysisRequest,
        visualizeTopN: number = 3
    ): Promise<{
        analysis: RoomAnalysis;
        visualization?: { imageBase64: string; allImages?: string[]; description?: string };
    }> {
        // Step 1: Analyze
        console.log('[GeminiService] Starting combined analysis + visualization...');
        
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

        if (analysis.modifications && analysis.modifications.length > 0) {
            const topMods = analysis.modifications
                .slice(0, visualizeTopN)
                .map(m => m.name);

            console.log('[GeminiService] Visualizing top modifications:', topMods);

            try {
                visualization = await this.generateVisualization(
                    request.imageBase64,
                    topMods
                );
            } catch (vizError) {
                console.warn("[GeminiService] Visualization failed, returning analysis only:", vizError);
            }
        }

        return { analysis, visualization };
    }

    /**
     * Interactive visualization session using chat.
     */
    createVisualizationSession(originalImageBase64: string) {
        const chat = this.client.chats.create({
            model: IMAGE_MODEL,
            config: {
                responseModalities: ['image', 'text'],
            }
        });

        const extractImages = (response: any) => {
            const images: string[] = [];
            let description: string | undefined;

            if (response.candidates && response.candidates.length > 0) {
                const parts = response.candidates[0].content?.parts || [];
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

            return { imageBase64: images[0], allImages: images, description };
        };

        return {
            applyModifications: async (modifications: string[]) => {
                const prompt = buildVisualizationPrompt(modifications);
                const response = await chat.sendMessage([
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: originalImageBase64,
                        },
                    },
                    { text: prompt },
                ]);
                return extractImages(response);
            },

            refine: async (instruction: string) => {
                const response = await chat.sendMessage(instruction);
                return extractImages(response);
            },

            getHistory: () => chat.getHistory(),
        };
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

let _geminiService: GeminiService | null = null;

export function getGeminiService(): GeminiService {
    if (!_geminiService) {
        _geminiService = new GeminiService();
    }
    return _geminiService;
}

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
