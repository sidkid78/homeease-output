"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

interface BeforeAfterComparisonProps {
    beforeImage: string;
    afterImage: string;
    modifications?: string[];
    description?: string;
}

/**
 * Interactive before/after image comparison slider
 */
export function BeforeAfterComparison({
    beforeImage,
    afterImage,
    modifications = [],
    description
}: BeforeAfterComparisonProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Before & After Visualization
                </CardTitle>
                {modifications.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Showing: {modifications.join(', ')}
                    </p>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <div 
                    ref={containerRef}
                    className="relative h-[400px] cursor-ew-resize select-none overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                >
                    {/* After Image (background) */}
                    <img
                        src={afterImage}
                        alt="After modifications"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                    
                    {/* Before Image (clipped) */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <img
                            src={beforeImage}
                            alt="Before modifications"
                            className="h-full object-cover"
                            style={{ 
                                width: containerRef.current?.offsetWidth || '100%',
                                maxWidth: 'none'
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Slider Line */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                        {/* Slider Handle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-primary">
                            <ArrowRight className="h-4 w-4 text-primary rotate-180" />
                            <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        BEFORE
                    </div>
                    <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        AFTER
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs">
                        ← Drag to compare →
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
