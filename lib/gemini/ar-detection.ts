/**
 * AR Detection Module for HOMEase
 * 
 * Extends the base Gemini service with WebXR-specific capabilities:
 * - Object detection with bounding boxes
 * - Segmentation masks for precise measurements
 * - Real-time frame analysis for AR overlays
 * - ADA compliance checking
 * 
 * @example
 * ```typescript
 * import { arDetectionService } from '@/lib/gemini/ar-detection'
 * 
 * // Detect barriers with bounding boxes
 * const result = await arDetectionService.detectBarriers(frameBase64)
 * 
 * // Get segmentation for measurements
 * const segments = await arDetectionService.getSegmentation(frameBase64)
 * ```
 */

import { GoogleGenAI, Type, Schema } from "@google/genai";

// ============================================================================
// Types
// ============================================================================

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  confidence: number;
  accessibility_concern: string;
  ada_compliant: boolean;
  estimated_dimension_inches?: {
    width?: number;
    height?: number;
    depth?: number;
  };
}

export interface SegmentationMask {
  label: string;
  box_2d: [number, number, number, number];
  mask_base64: string; // Base64 PNG mask
  accessibility_concern: string;
}

export interface AROverlay {
  type: 'barrier' | 'measurement' | 'suggestion' | 'compliant';
  box_2d: [number, number, number, number];
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'ok';
  color: string;
  description: string;
  ada_requirement?: string;
}

export interface ARDetectionResult {
  objects: DetectedObject[];
  overlays: AROverlay[];
  ada_issues: string[];
  accessibility_score: number;
  frame_summary: string;
}

export interface SegmentationResult {
  segments: SegmentationMask[];
  room_dimensions_estimate?: {
    width_feet?: number;
    depth_feet?: number;
  };
}

// ============================================================================
// Schemas for Structured Output
// ============================================================================

const detectedObjectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    label: {
      type: Type.STRING,
      description: "Descriptive label (e.g., 'narrow_doorway', 'step_threshold', 'bathtub_edge')"
    },
    box_2d: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
      description: "[ymin, xmin, ymax, xmax] normalized to 0-1000"
    },
    confidence: {
      type: Type.NUMBER,
      description: "Detection confidence 0.0-1.0"
    },
    accessibility_concern: {
      type: Type.STRING,
      description: "Why this object is relevant for accessibility assessment"
    },
    ada_compliant: {
      type: Type.BOOLEAN,
      description: "Whether this meets ADA requirements"
    },
    estimated_dimension_inches: {
      type: Type.OBJECT,
      properties: {
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        depth: { type: Type.NUMBER }
      },
      description: "Estimated dimensions based on reference objects"
    }
  },
  required: ["label", "box_2d", "confidence", "accessibility_concern", "ada_compliant"]
};

const arDetectionResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    objects: {
      type: Type.ARRAY,
      items: detectedObjectSchema,
      description: "All detected accessibility-relevant objects"
    },
    ada_issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of ADA compliance issues found"
    },
    accessibility_score: {
      type: Type.INTEGER,
      description: "Overall accessibility score 0-100"
    },
    frame_summary: {
      type: Type.STRING,
      description: "Brief summary of what's in this frame"
    }
  },
  required: ["objects", "ada_issues", "accessibility_score", "frame_summary"]
};

// ============================================================================
// AR Detection Service
// ============================================================================

export class ARDetectionService {
  private client: GoogleGenAI;

  private static DETECTION_PROMPT = `You are an accessibility assessment AI analyzing a frame from a WebXR AR session.

TASK: Detect ALL accessibility-relevant objects and provide bounding boxes.

For each object, provide:
1. label: Descriptive name (e.g., "narrow_doorway_32in", "step_threshold_2in", "grab_bar_location")
2. box_2d: Bounding box as [ymin, xmin, ymax, xmax] normalized to 0-1000 scale
3. confidence: Your confidence in the detection (0.0-1.0)
4. accessibility_concern: Why this matters for accessibility
5. ada_compliant: Whether it meets ADA requirements
6. estimated_dimension_inches: Estimate dimensions using reference objects

ADA REQUIREMENTS TO CHECK:
- Doorways: minimum 32" clear width (36" preferred)
- Hallways: minimum 36" width (48" preferred for wheelchairs)
- Thresholds: maximum 1/2" height
- Grab bars: 33-36" mounting height, 1.25-1.5" diameter
- Toilet clearance: 60" turning radius
- Counter heights: 34" maximum for accessibility
- Light switches: 48" maximum height
- Outlets: 15" minimum height

OBJECTS TO DETECT:
- Doorways (measure width)
- Thresholds/steps (measure height)
- Stairs and handrails
- Bathroom fixtures (toilet, tub, shower)
- Grab bar mounting locations
- Flooring transitions
- Light switches and outlets
- Counters and cabinets
- Obstacles and trip hazards

Provide accurate bounding boxes for AR overlay rendering.`;

  private static SEGMENTATION_PROMPT = `Segment all accessibility-relevant objects in this image.

For each object, provide:
- label: Descriptive name
- box_2d: [ymin, xmin, ymax, xmax] normalized to 0-1000
- mask: Base64 encoded PNG segmentation mask within the bounding box
- accessibility_concern: Why this is relevant

Focus on objects that would need modification for aging-in-place:
doorways, thresholds, stairs, bathroom fixtures, flooring, etc.

Return precise contour masks for accurate AR overlay and measurement.`;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("Gemini API key not found");
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  /**
   * Detect accessibility barriers with bounding boxes for AR overlay.
   * Optimized for real-time performance.
   */
  async detectBarriers(
    imageBase64: string,
    mimeType: string = "image/jpeg"
  ): Promise<ARDetectionResult> {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: ARDetectionService.DETECTION_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: arDetectionResultSchema,
        thinkingConfig: { thinkingBudget: 0 } // Fast mode for real-time
      }
    });

    if (!response.text) {
      throw new Error("No response from detection model");
    }

    const result = JSON.parse(response.text) as Omit<ARDetectionResult, 'overlays'>;
    
    // Generate AR overlays from detected objects
    const overlays = this.generateOverlays(result.objects);

    return { ...result, overlays };
  }

  /**
   * Get segmentation masks for precise measurements.
   * Use for detailed analysis, not real-time.
   */
  async getSegmentation(
    imageBase64: string,
    mimeType: string = "image/jpeg"
  ): Promise<SegmentationResult> {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: ARDetectionService.SEGMENTATION_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    if (!response.text) {
      throw new Error("No response from segmentation model");
    }

    return JSON.parse(response.text) as SegmentationResult;
  }

  /**
   * Process a WebXR frame for real-time AR overlay.
   * Returns minimal data optimized for AR rendering.
   */
  async processARFrame(
    imageBase64: string,
    previousContext?: string
  ): Promise<{
    overlays: AROverlay[];
    score: number;
    summary: string;
  }> {
    const result = await this.detectBarriers(imageBase64);
    
    return {
      overlays: result.overlays,
      score: result.accessibility_score,
      summary: result.frame_summary
    };
  }

  /**
   * Convert detected objects to AR overlay format
   */
  private generateOverlays(objects: DetectedObject[]): AROverlay[] {
    return objects.map(obj => {
      const severity = this.calculateSeverity(obj);
      
      return {
        type: obj.ada_compliant ? 'compliant' : 'barrier',
        box_2d: obj.box_2d,
        label: obj.label,
        severity,
        color: this.severityToColor(severity),
        description: obj.accessibility_concern,
        ada_requirement: this.getADARequirement(obj.label)
      };
    });
  }

  private calculateSeverity(obj: DetectedObject): AROverlay['severity'] {
    if (obj.ada_compliant) return 'ok';
    
    const label = obj.label.toLowerCase();
    
    // Critical: Complete barriers
    if (label.includes('blocked') || label.includes('no_access')) return 'critical';
    
    // High: Safety hazards
    if (label.includes('step') || label.includes('threshold') || 
        label.includes('trip') || label.includes('narrow')) return 'high';
    
    // Medium: Accessibility issues
    if (label.includes('height') || label.includes('reach') || 
        label.includes('grip')) return 'medium';
    
    return 'low';
  }

  private severityToColor(severity: AROverlay['severity']): string {
    const colors = {
      critical: '#FF0000',
      high: '#FF6600',
      medium: '#FFCC00',
      low: '#00CC00',
      ok: '#00FF00'
    };
    return colors[severity];
  }

  private getADARequirement(label: string): string | undefined {
    const requirements: Record<string, string> = {
      doorway: 'Min 32" clear width (36" preferred)',
      threshold: 'Max 1/2" height',
      hallway: 'Min 36" width (48" for wheelchairs)',
      grab_bar: '33-36" height, 1.25-1.5" diameter',
      toilet: '60" turning radius clearance',
      counter: 'Max 34" height for accessibility',
      switch: 'Max 48" height',
      outlet: 'Min 15" height'
    };

    const key = Object.keys(requirements).find(k => 
      label.toLowerCase().includes(k)
    );

    return key ? requirements[key] : undefined;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let _arDetectionService: ARDetectionService | null = null;

export function getARDetectionService(): ARDetectionService {
  if (!_arDetectionService) {
    _arDetectionService = new ARDetectionService();
  }
  return _arDetectionService;
}

export const arDetectionService = {
  detectBarriers: (...args: Parameters<ARDetectionService['detectBarriers']>) =>
    getARDetectionService().detectBarriers(...args),
  getSegmentation: (...args: Parameters<ARDetectionService['getSegmentation']>) =>
    getARDetectionService().getSegmentation(...args),
  processARFrame: (...args: Parameters<ARDetectionService['processARFrame']>) =>
    getARDetectionService().processARFrame(...args),
};
