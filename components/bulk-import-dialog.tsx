"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiKeysForRequest } from "@/lib/api-keys";
import { useSelectedBrand } from "@/lib/brand-context";

interface ImportAd {
  id: string;
  imageData: string;
  adCopy: string;
  metaUrl?: string;
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: BulkImportDialogProps) {
  const { selectedBrand } = useSelectedBrand();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ads, setAds] = useState<ImportAd[]>([]);
  const [metaUrl, setMetaUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("Please select image files");
      return;
    }

    const newAds: ImportAd[] = [];

    imageFiles.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const ad: ImportAd = {
          id: `${Date.now()}-${Math.random()}`,
          imageData,
          adCopy: "", // Will be filled by AI analysis
          metaUrl: metaUrl || undefined,
        };
        newAds.push(ad);
        setAds((prev) => [...prev, ad]);
      };
      reader.readAsDataURL(file);
    });
  }, [metaUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeAd = (id: string) => {
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  const handleImport = async () => {
    if (ads.length === 0) {
      toast.error("Please add at least one ad image");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportedCount(0);

    try {
      const apiHeaders = getApiKeysForRequest();
      const response = await fetch("/api/ads/import-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...apiHeaders,
        },
        body: JSON.stringify({
          ads: ads.map((ad) => ({
            imageData: ad.imageData,
            adCopy: ad.adCopy,
            metaUrl: ad.metaUrl,
            brandId: selectedBrand?.id,
            brandName: selectedBrand?.name || "Imported",
          })),
          brandId: selectedBrand?.id,
          brandName: selectedBrand?.name || "Imported",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Import failed");
        return;
      }

      setImportedCount(data.imported);
      toast.success(`Successfully imported ${data.imported} ads!`);
      
      // Reset and close
      setTimeout(() => {
        setAds([]);
        setMetaUrl("");
        setImportProgress(0);
        setImportedCount(0);
        onOpenChange(false);
        onImportComplete();
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import ads");
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setAds([]);
    setMetaUrl("");
    setImportProgress(0);
    setImportedCount(0);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="bg-neutral-900 border-neutral-800 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-500" />
            Import Ads from Meta Ads Library
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Upload multiple ad screenshots to import them all at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Meta URL Input */}
          <div className="space-y-2">
            <Label className="text-neutral-300">Meta Ads Library URL (Optional)</Label>
            <Input
              placeholder="https://www.facebook.com/ads/library/?view_all_page_id=..."
              value={metaUrl}
              onChange={(e) => {
                setMetaUrl(e.target.value);
                // Update all ads with this URL
                setAds((prev) =>
                  prev.map((ad) => ({ ...ad, metaUrl: e.target.value }))
                );
              }}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <p className="text-xs text-neutral-500">
              Paste the Meta Ads Library URL to link all imported ads
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-neutral-700 hover:border-neutral-600"
            )}
          >
            <Upload className="w-12 h-12 mx-auto text-neutral-500 mb-4" />
            <p className="text-neutral-400 mb-2">
              Drag & drop ad screenshots here, or click to select
            </p>
            <p className="text-xs text-neutral-500">
              You can select multiple images at once
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Selected Ads Preview */}
          {ads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-neutral-300">
                  {ads.length} ad{ads.length !== 1 ? "s" : ""} ready to import
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAds([])}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <ScrollArea className="h-64 border border-neutral-800 rounded-lg p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="relative group rounded-lg overflow-hidden border border-neutral-700"
                    >
                      <img
                        src={ad.imageData}
                        alt="Ad preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAd(ad.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">
                  Importing ads...
                </span>
                <span className="text-neutral-400">
                  {importedCount} / {ads.length}
                </span>
              </div>
              <Progress value={(importedCount / ads.length) * 100} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {importedCount > 0 && !isImporting && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-500 text-sm">
                Successfully imported {importedCount} ad{importedCount !== 1 ? "s" : ""}!
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetDialog();
            }}
            disabled={isImporting}
            className="border-neutral-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={ads.length === 0 || isImporting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {ads.length} Ad{ads.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
