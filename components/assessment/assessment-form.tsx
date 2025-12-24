"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    onImageChange: (file: File | null, preview: string | null) => void;
    preview: string | null;
}

function ImageUpload({ onImageChange, preview }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File | null) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageChange(file, e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const clearImage = () => {
        onImageChange(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <Label>Room Photo</Label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Room preview"
                        className="w-full h-64 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={clearImage}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Card
                    className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50"
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-4">
                            <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Drop an image here or click to upload</p>
                            <p className="text-sm text-muted-foreground">
                                Supports JPG, PNG, HEIC up to 10MB
                            </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button type="button" variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Browse Files
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Hidden file input with camera capture support */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
        </div>
    );
}

interface AssessmentFormProps {
    userId: string;
    onSubmit: (formData: FormData) => Promise<void>;
}

export function AssessmentForm({ userId, onSubmit }: AssessmentFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (file: File | null, preview: string | null) => {
        setImageFile(file);
        setImagePreview(preview);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            formData.set("homeowner_id", userId);

            if (imageFile) {
                formData.set("image", imageFile);
            }

            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting assessment:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="homeowner_id" value={userId} />

            <ImageUpload
                onImageChange={handleImageChange}
                preview={imagePreview}
            />

            <div>
                <Label htmlFor="homeAddress">Home Address</Label>
                <Input
                    id="homeAddress"
                    name="homeAddress"
                    placeholder="123 Main St, Anytown, USA"
                    required
                />
            </div>

            <div>
                <Label htmlFor="roomType">Room Type</Label>
                <select
                    id="roomType"
                    name="roomType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                >
                    <option value="">Select a room type...</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="living_room">Living Room</option>
                    <option value="entrance">Entrance/Hallway</option>
                    <option value="stairs">Stairs</option>
                    <option value="garage">Garage</option>
                    <option value="outdoor">Outdoor/Patio</option>
                </select>
            </div>

            <div>
                <Label htmlFor="assessmentDetails">Describe Your Concerns</Label>
                <Textarea
                    id="assessmentDetails"
                    name="assessmentDetails"
                    placeholder="What challenges do you face in this space? Any specific mobility concerns, safety issues, or modifications you're considering?"
                    rows={4}
                    required
                />
            </div>

            <div>
                <Label htmlFor="budgetRange">Budget Range (Optional)</Label>
                <select
                    id="budgetRange"
                    name="budgetRange"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select budget range...</option>
                    <option value="under_1000">Under $1,000</option>
                    <option value="1000_5000">$1,000 - $5,000</option>
                    <option value="5000_15000">$5,000 - $15,000</option>
                    <option value="15000_50000">$15,000 - $50,000</option>
                    <option value="over_50000">Over $50,000</option>
                </select>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span>
                        Analyzing...
                    </>
                ) : (
                    "Submit Assessment"
                )}
            </Button>
        </form>
    );
}
