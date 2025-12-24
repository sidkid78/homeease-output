'use client';

/**
 * WebXR AR Scanner Component
 * 
 * Provides real-time AR assessment using device camera.
 * Falls back to standard camera capture on non-AR devices.
 * 
 * @example
 * ```tsx
 * <WebXRScanner
 *   onAssessmentComplete={(result) => console.log(result)}
 *   roomLabel="bathroom"
 * />
 * ```
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  XCircle,
  Eye
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface AROverlay {
  type: 'barrier' | 'measurement' | 'suggestion' | 'compliant';
  box_2d: [number, number, number, number];
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'ok';
  color: string;
  description: string;
  ada_requirement?: string;
}

interface ScanResult {
  overlays: AROverlay[];
  score: number;
  summary: string;
  ada_issues?: string[];
}

interface WebXRScannerProps {
  roomLabel?: string;
  onAssessmentComplete?: (result: ScanResult) => void;
  onFrameCapture?: (frameBase64: string) => void;
  autoScan?: boolean;
  scanIntervalMs?: number;
}

// ============================================================================
// Component
// ============================================================================

export function WebXRScanner({
  roomLabel = 'room',
  onAssessmentComplete,
  onFrameCapture,
  autoScan = false,
  scanIntervalMs = 2000
}: WebXRScannerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [overlays, setOverlays] = useState<AROverlay[]>([]);

  // Check WebXR support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar')
        .then((supported: boolean) => setIsWebXRSupported(supported))
        .catch(() => setIsWebXRSupported(false));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setIsStreaming(true);

      // Start auto-scan if enabled
      if (autoScan) {
        startAutoScan();
      }

    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please grant permission.');
    }
  }, [autoScan]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setOverlays([]);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // Capture current frame as base64
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }, []);

  // Process frame with backend
  const processFrame = useCallback(async (frameBase64: string) => {
    try {
      const response = await fetch('/api/ar-assessment.ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame: frameBase64,
          room_label: roomLabel,
          mode: 'fast'
        })
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setOverlays(result.overlays || []);
        setCurrentResult({
          overlays: result.overlays || [],
          score: result.score || 0,
          summary: result.summary || '',
          ada_issues: result.ada_issues
        });

        // Callback
        onAssessmentComplete?.({
          overlays: result.overlays || [],
          score: result.score || 0,
          summary: result.summary || '',
          ada_issues: result.ada_issues
        });
      }

    } catch (err) {
      console.error('Processing error:', err);
    }
  }, [roomLabel, onAssessmentComplete]);

  // Single scan
  const performScan = useCallback(async () => {
    if (isScanning) return;

    setIsScanning(true);
    
    try {
      const frameBase64 = captureFrame();
      if (frameBase64) {
        onFrameCapture?.(frameBase64);
        await processFrame(frameBase64);
      }
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, captureFrame, processFrame, onFrameCapture]);

  // Start auto-scanning
  const startAutoScan = useCallback(() => {
    if (scanIntervalRef.current) return;

    scanIntervalRef.current = setInterval(() => {
      performScan();
    }, scanIntervalMs);
  }, [performScan, scanIntervalMs]);

  // Draw overlays on canvas
  useEffect(() => {
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!video || !overlayCanvas || overlays.length === 0) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    overlayCanvas.width = video.videoWidth || 640;
    overlayCanvas.height = video.videoHeight || 480;

    // Clear previous overlays
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Draw each overlay
    overlays.forEach(overlay => {
      const [ymin, xmin, ymax, xmax] = overlay.box_2d;
      
      // Convert from 0-1000 to pixel coordinates
      const x = (xmin / 1000) * overlayCanvas.width;
      const y = (ymin / 1000) * overlayCanvas.height;
      const width = ((xmax - xmin) / 1000) * overlayCanvas.width;
      const height = ((ymax - ymin) / 1000) * overlayCanvas.height;

      // Draw bounding box
      ctx.strokeStyle = overlay.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = overlay.color;
      const labelWidth = ctx.measureText(overlay.label).width + 10;
      ctx.fillRect(x, y - 25, labelWidth, 22);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(overlay.label, x + 5, y - 8);
    });
  }, [overlays]);

  // Get severity icon
  const getSeverityIcon = (severity: AROverlay['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Camera View */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              AR Scanner
              {isWebXRSupported && (
                <Badge variant="secondary" className="text-xs">WebXR Ready</Badge>
              )}
            </CardTitle>
            {currentResult && (
              <div className={`text-2xl font-bold ${getScoreColor(currentResult.score)}`}>
                {currentResult.score}/100
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {/* Video Element */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Overlay Canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {/* Hidden capture canvas */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Status overlay */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button onClick={startCamera} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
            
            {isScanning && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-blue-500">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Scanning...
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          {isStreaming && (
            <div className="p-4 flex gap-2">
              <Button 
                onClick={performScan} 
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Scan className="h-4 w-4 mr-2" />
                )}
                Scan Room
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (scanIntervalRef.current) {
                    clearInterval(scanIntervalRef.current);
                    scanIntervalRef.current = null;
                  } else {
                    startAutoScan();
                  }
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {scanIntervalRef.current ? 'Stop Auto' : 'Auto Scan'}
              </Button>
              <Button variant="destructive" onClick={stopCamera}>
                Stop
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentResult && overlays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Items ({overlays.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overlays.map((overlay, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                >
                  {getSeverityIcon(overlay.severity)}
                  <div className="flex-1">
                    <div className="font-medium">{overlay.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {overlay.description}
                    </div>
                    {overlay.ada_requirement && (
                      <div className="text-xs text-blue-600 mt-1">
                        ADA: {overlay.ada_requirement}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={overlay.severity === 'ok' ? 'default' : 'destructive'}
                    style={{ backgroundColor: overlay.color }}
                  >
                    {overlay.severity}
                  </Badge>
                </div>
              ))}
            </div>

            {currentResult.summary && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-800">
                <strong>Summary:</strong> {currentResult.summary}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WebXRScanner;
