"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Download,
  RefreshCw,
  Save,
  Sparkles,
  Image as ImageIcon,
  Square,
  RectangleVertical,
  RectangleHorizontal,
} from "lucide-react";

type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "3:4";
type ImageStyle = "realistic" | "illustrated" | "minimal" | "photographic" | "digital-art" | "3d-render";

interface GenerateImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConcept?: string;
  brandName?: string;
  onSaveToLibrary?: (imageData: string, prompt: string) => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: "1:1", label: "Square (1:1)", icon: <Square className="w-4 h-4" /> },
  { value: "4:5", label: "Portrait (4:5)", icon: <RectangleVertical className="w-4 h-4" /> },
  { value: "9:16", label: "Story (9:16)", icon: <RectangleVertical className="w-4 h-4" /> },
  { value: "16:9", label: "Landscape (16:9)", icon: <RectangleHorizontal className="w-4 h-4" /> },
  { value: "3:4", label: "Classic (3:4)", icon: <RectangleVertical className="w-4 h-4" /> },
];

const IMAGE_STYLES: { value: ImageStyle; label: string; description: string }[] = [
  { value: "photographic", label: "Photographic", description: "Professional product photography" },
  { value: "realistic", label: "Realistic", description: "Photorealistic, high quality" },
  { value: "minimal", label: "Minimal", description: "Clean, simple, modern" },
  { value: "illustrated", label: "Illustrated", description: "Digital illustration style" },
  { value: "digital-art", label: "Digital Art", description: "Creative, artistic" },
  { value: "3d-render", label: "3D Render", description: "CGI, realistic materials" },
];

export function GenerateImageDialog({
  open,
  onOpenChange,
  initialConcept = "",
  brandName = "",
  onSaveToLibrary,
}: GenerateImageDialogProps) {
  const [prompt, setPrompt] = useState(() => {
    if (initialConcept) {
      return `Create a professional advertisement image for ${brandName || "a brand"}. Concept: ${initialConcept}. The image should be eye-catching, suitable for social media advertising.`;
    }
    return "";
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [style, setStyle] = useState<ImageStyle>("photographic");
  const [negativePrompt, setNegativePrompt] = useState("text, watermark, logo, blurry, low quality");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          style,
          negativePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to generate image");
        return;
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ad-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleSaveToLibrary = () => {
    if (generatedImage && onSaveToLibrary) {
      onSaveToLibrary(generatedImage, prompt);
      toast.success("Saved to Ad Library!");
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Generate Ad Image
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Create an AI-generated image for your ad concept
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left: Controls */}
          <div className="space-y-4">
            {/* Prompt */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Image Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={4}
                className="bg-neutral-800 border-neutral-700 text-white resize-none"
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Style</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {IMAGE_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-white">
                      <div>
                        <span className="font-medium">{s.label}</span>
                        <span className="text-neutral-400 text-xs ml-2">
                          {s.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Aspect Ratio</Label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                      aspectRatio === ar.value
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    )}
                  >
                    {ar.icon}
                    <span className="text-xs">{ar.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Avoid (Negative Prompt)</Label>
              <Textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Things to avoid in the image..."
                rows={2}
                className="bg-neutral-800 border-neutral-700 text-white resize-none text-sm"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <Label className="text-neutral-300">Preview</Label>
            <div
              className={cn(
                "relative rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden",
                generatedImage
                  ? "border-blue-500/50 bg-neutral-800"
                  : "border-neutral-700 bg-neutral-800/50",
                aspectRatio === "1:1" && "aspect-square",
                aspectRatio === "4:5" && "aspect-[4/5]",
                aspectRatio === "9:16" && "aspect-[9/16] max-h-[400px]",
                aspectRatio === "16:9" && "aspect-video",
                aspectRatio === "3:4" && "aspect-[3/4]"
              )}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <span className="text-sm">Generating your image...</span>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated ad"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-500 p-4 text-center">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">
                    Your generated image will appear here
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {generatedImage && (
              <div className="flex gap-2">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1 border-neutral-700"
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 border-neutral-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {onSaveToLibrary && (
                  <Button
                    onClick={handleSaveToLibrary}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
