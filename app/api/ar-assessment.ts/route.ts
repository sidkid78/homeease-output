/**
 * AR Assessment API Route
 * 
 * Handles real-time WebXR frame processing for AR overlays.
 * 
 * POST /api/ar-assessment.ts
 * - Processes a single frame and returns AR overlay data
 * - Designed for polling from WebXR client
 * 
 * GET /api/ar-assessment.ts
 * - Returns capability info and health check
 */

import { NextRequest, NextResponse } from 'next/server';
import { getARDetectionService, type AROverlay } from '@/lib/gemini/ar-detection';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Types
// ============================================================================

interface FrameRequest {
  frame: string;          // Base64 image (required)
  mime_type?: string;     // Default: image/jpeg
  room_label?: string;    // Optional room context
  user_id?: string;       // Optional for auth
  session_id?: string;    // Optional for tracking
  mode?: 'fast' | 'detailed'; // Processing mode
}

interface FrameResponse {
  success: boolean;
  overlays?: AROverlay[];
  score?: number;
  summary?: string;
  ada_issues?: string[];
  error?: string;
  processing_time_ms?: number;
}

interface BatchFrameRequest {
  frames: Array<{
    frame: string;
    room_label?: string;
  }>;
  user_id?: string;
}

// ============================================================================
// POST Handler - Process AR Frame
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<FrameResponse>> {
  const startTime = Date.now();

  try {
    const body = await request.json() as FrameRequest;

    // Validate required fields
    if (!body.frame) {
      return NextResponse.json(
        { success: false, error: 'Missing frame data. Send base64 encoded image.' },
        { status: 400 }
      );
    }

    // Validate base64 (basic check)
    if (body.frame.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid frame data. Expected base64 encoded image.' },
        { status: 400 }
      );
    }

    // Optional: Verify user authentication
    if (body.user_id) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== body.user_id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Strip data URL prefix if present
    let frameData = body.frame;
    if (frameData.includes('base64,')) {
      frameData = frameData.split('base64,')[1];
    }

    // Process frame with AR detection service
    const arService = getARDetectionService();
    
    if (body.mode === 'detailed') {
      // Full detection with all details
      const result = await arService.detectBarriers(
        frameData,
        body.mime_type || 'image/jpeg'
      );

      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        overlays: result.overlays,
        score: result.accessibility_score,
        summary: result.frame_summary,
        ada_issues: result.ada_issues,
        processing_time_ms: processingTime
      });
    } else {
      // Fast mode for real-time AR
      const result = await arService.processARFrame(frameData, body.room_label);

      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        overlays: result.overlays,
        score: result.score,
        summary: result.summary,
        processing_time_ms: processingTime
      });
    }

  } catch (error) {
    console.error('[AR Assessment API] Error:', error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Frame processing failed',
        processing_time_ms: processingTime
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Health Check & Capabilities
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'homeease-ar-assessment',
    version: '1.0.0',
    capabilities: [
      'barrier_detection',
      'bounding_boxes',
      'ada_compliance_check',
      'accessibility_scoring',
      'segmentation',
      'real_time_overlay'
    ],
    models: {
      detection: 'gemini-2.5-flash',
      segmentation: 'gemini-2.5-flash',
      visualization: 'gemini-2.5-flash-image-preview'
    },
    ada_checks: [
      'doorway_width (min 32")',
      'threshold_height (max 0.5")',
      'hallway_width (min 36")',
      'grab_bar_height (33-36")',
      'toilet_clearance (60" turning radius)',
      'counter_height (max 34")',
      'switch_height (max 48")',
      'outlet_height (min 15")'
    ],
    usage: {
      endpoint: 'POST /api/ar-assessment.ts',
      content_type: 'application/json',
      body: {
        frame: 'base64 encoded image (required)',
        mime_type: 'image/jpeg | image/png | image/webp (optional, default: image/jpeg)',
        room_label: 'bathroom | bedroom | kitchen | etc (optional)',
        user_id: 'uuid (optional, for authenticated requests)',
        session_id: 'uuid (optional, for session tracking)',
        mode: 'fast | detailed (optional, default: fast)'
      },
      response: {
        success: 'boolean',
        overlays: 'AROverlay[] - bounding boxes and labels for AR rendering',
        score: 'number 0-100 - accessibility score',
        summary: 'string - brief description of findings',
        ada_issues: 'string[] - ADA compliance issues (detailed mode only)',
        processing_time_ms: 'number - processing time in milliseconds'
      }
    },
    rate_limits: {
      frames_per_second: 2,
      note: 'For real-time AR, poll every 500ms'
    }
  });
}
