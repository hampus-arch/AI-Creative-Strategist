"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FRAMEWORK_PHASES, type FrameworkPhase } from "@/lib/framework";
import { type AdFormat, type MockBrand, extractMetaPageId } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Loader2,
  X,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

interface AddAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands: MockBrand[];
  defaultBrandId?: string;
  onAdCreated: () => void;
}

export function AddAdDialog({ open, onOpenChange, brands, defaultBrandId, onAdCreated }: AddAdDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form state
  const [imageData, setImageData] = useState<string>("");
  const [metaUrl, setMetaUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(defaultBrandId || "");
  const [adCopy, setAdCopy] = useState("");
  const [hook, setHook] = useState("");
  const [cta, setCta] = useState("");
  const [format, setFormat] = useState<AdFormat>("image");
  const [frameworkPhase, setFrameworkPhase] = useState<FrameworkPhase>("INTERRUPT");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");

  // Update selectedBrandId when defaultBrandId changes
  useEffect(() => {
    if (defaultBrandId) {
      setSelectedBrandId(defaultBrandId);
    }
  }, [defaultBrandId, open]);

  const resetForm = () => {
    setImageData("");
    setMetaUrl("");
    setBrandName("");
    setSelectedBrandId(defaultBrandId || "");
    setAdCopy("");
    setHook("");
    setCta("");
    setFormat("image");
    setFrameworkPhase("INTERRUPT");
    setTags([]);
    setTagInput("");
    setAiAnalysis("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMetaUrlPaste = () => {
    const pageId = extractMetaPageId(metaUrl);
    if (pageId) {
      toast.success(`Page ID extracted: ${pageId}`);
    }
  };

  const handleAiAnalyze = async () => {
    if (!imageData && !adCopy) {
      toast.error("Please upload an image or enter ad copy first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, adCopy }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Analysis failed");
        return;
      }

      const { analysis } = data;

      // Auto-fill form with AI analysis
      if (analysis.hook) setHook(analysis.hook);
      if (analysis.adCopy && !adCopy) setAdCopy(analysis.adCopy);
      if (analysis.cta) setCta(analysis.cta);
      if (analysis.frameworkPhase) setFrameworkPhase(analysis.frameworkPhase);
      if (analysis.format) setFormat(analysis.format);
      if (analysis.tags) setTags(analysis.tags);
      if (analysis.analysis) setAiAnalysis(analysis.analysis);

      toast.success("AI analysis complete!");
    } catch {
      toast.error("Failed to analyze ad");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    const finalBrandName = selectedBrandId
      ? brands.find((b) => b.id === selectedBrandId)?.name || brandName
      : brandName;

    if (!finalBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (!adCopy.trim()) {
      toast.error("Ad copy is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId || undefined,
          brandName: finalBrandName,
          imageData: imageData || undefined,
          adCopy,
          hook: hook || undefined,
          cta: cta || undefined,
          format,
          frameworkPhase,
          metaAdsLibraryUrl: metaUrl || undefined,
          aiAnalysis: aiAnalysis || undefined,
          tags,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to save ad");
        return;
      }

      toast.success("Ad saved to library!");
      resetForm();
      onOpenChange(false);
      onAdCreated();
    } catch {
      toast.error("Failed to save ad");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPhase = FRAMEWORK_PHASES.find((p) => p.id === frameworkPhase);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add Ad to Library</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Save an ad for inspiration and analysis
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-neutral-800 border-neutral-700">
            <TabsTrigger value="upload" className="data-[state=active]:bg-orange-500">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-orange-500">
              <LinkIcon className="w-4 h-4 mr-2" />
              Meta URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-orange-500">
              <FileText className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                imageData
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-neutral-700 hover:border-neutral-600"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageData ? (
                <div className="relative">
                  <img
                    src={imageData}
                    alt="Uploaded ad"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageData("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 mx-auto text-neutral-500 mb-2" />
                  <p className="text-neutral-400">
                    Click or drag to upload screenshot
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {imageData && (
              <Button
                onClick={handleAiAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI Analyze Screenshot
              </Button>
            )}
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neutral-300">Meta Ads Library URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.facebook.com/ads/library/..."
                  value={metaUrl}
                  onChange={(e) => setMetaUrl(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <Button
                  variant="outline"
                  onClick={handleMetaUrlPaste}
                  className="border-neutral-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-neutral-500">
                Paste a link from Meta Ads Library. You&apos;ll need to manually copy the ad content.
              </p>
            </div>

            <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <h4 className="text-sm font-medium text-white mb-2">How to use:</h4>
              <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                <li>Go to Meta Ads Library and find the ad</li>
                <li>Paste the URL above</li>
                <li>Take a screenshot of the ad</li>
                <li>Upload the screenshot in the Upload tab</li>
                <li>Use AI Analyze to extract the content</li>
              </ol>
            </div>
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <p className="text-sm text-neutral-400">
              Manually enter ad details below
            </p>
          </TabsContent>
        </Tabs>

        {/* Common Fields */}
        <div className="space-y-4 mt-6 border-t border-neutral-800 pt-6">
          {/* Brand Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-300">Select Brand</Label>
              <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Choose existing brand" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="none" className="text-neutral-400">
                    None (enter manually)
                  </SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id} className="text-white">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Or Enter Brand Name</Label>
              <Input
                placeholder="Brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={!!selectedBrandId && selectedBrandId !== "none"}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>

          {/* Ad Copy */}
          <div className="space-y-2">
            <Label className="text-neutral-300">Ad Copy *</Label>
            <Textarea
              placeholder="Paste the ad text/copy here..."
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value)}
              rows={3}
              className="bg-neutral-800 border-neutral-700 text-white resize-none"
            />
          </div>

          {/* Hook & CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-300">Hook</Label>
              <Input
                placeholder="The attention-grabbing first line"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">CTA</Label>
              <Input
                placeholder="Call to action"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>

          {/* Format & Phase */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-300">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as AdFormat)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="image" className="text-white">Image</SelectItem>
                  <SelectItem value="video" className="text-white">Video</SelectItem>
                  <SelectItem value="carousel" className="text-white">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Framework Phase</Label>
              <Select
                value={frameworkPhase}
                onValueChange={(v) => setFrameworkPhase(v as FrameworkPhase)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {FRAMEWORK_PHASES.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id} className="text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full bg-gradient-to-r",
                            phase.color
                          )}
                        />
                        {phase.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-neutral-300">Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
              <Button variant="outline" onClick={handleAddTag} className="border-neutral-700">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-neutral-800 text-neutral-300"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Preview */}
          {aiAnalysis && (
            <div className="space-y-2">
              <Label className="text-neutral-300">AI Analysis</Label>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-neutral-300">{aiAnalysis}</p>
              </div>
            </div>
          )}

          {/* Selected Phase Info */}
          {selectedPhase && (
            <div className={cn(
              "p-3 rounded-lg border",
              "bg-gradient-to-r bg-opacity-10",
              selectedPhase.color.replace("from-", "border-").split(" ")[0] + "/30"
            )}>
              <p className="text-xs text-neutral-400">
                <strong className="text-white">{selectedPhase.name}:</strong> {selectedPhase.goal}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="border-neutral-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Save Ad
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
