"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { AdCard } from "@/components/ad-card";
import { AddAdDialog } from "@/components/add-ad-dialog";
import { FRAMEWORK_PHASES, type FrameworkPhase } from "@/lib/framework";
import { type SavedAd, type MockBrand } from "@/lib/mock-data";
import { useSelectedBrand } from "@/lib/brand-context";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Library,
  Loader2,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdsPage() {
  const [ads, setAds] = useState<SavedAd[]>([]);
  const [allBrands, setAllBrands] = useState<MockBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<SavedAd | null>(null);

  // Use global brand selection
  const { selectedBrand, brands } = useSelectedBrand();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  // Update allBrands when context brands change
  useEffect(() => {
    setAllBrands(brands);
  }, [brands]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adsRes, brandsRes] = await Promise.all([
        fetch("/api/ads"),
        fetch("/api/brands"),
      ]);

      const adsData = await adsRes.json();
      const brandsData = await brandsRes.json();

      setAds(adsData.ads || []);
      setAllBrands(brandsData.brands || []);
    } catch {
      toast.error("Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();

      toast.success("Ad deleted");
      setAds(ads.filter((ad) => ad.id !== id));
    } catch {
      toast.error("Failed to delete ad");
    }
  };

  const handleAnalyzeAd = async (ad: SavedAd) => {
    toast.info("Re-analyzing ad...");

    try {
      const response = await fetch("/api/ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: ad.imageData,
          adCopy: ad.adCopy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Analysis failed");
        return;
      }

      // Update ad with new analysis
      const updateResponse = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiAnalysis: data.analysis.analysis,
          hook: data.analysis.hook || ad.hook,
          frameworkPhase: data.analysis.frameworkPhase || ad.frameworkPhase,
          tags: data.analysis.tags || ad.tags,
        }),
      });

      if (updateResponse.ok) {
        toast.success("Analysis complete!");
        fetchData();
      }
    } catch {
      toast.error("Analysis failed");
    }
  };

  // Filter ads - use global brand selection
  const filteredAds = ads.filter((ad) => {
    // Brand filter (from global selector)
    if (selectedBrand && ad.brandId !== selectedBrand.id) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        ad.brandName.toLowerCase().includes(query) ||
        ad.adCopy.toLowerCase().includes(query) ||
        ad.hook?.toLowerCase().includes(query) ||
        ad.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Phase filter
    if (selectedPhase !== "all" && ad.frameworkPhase !== selectedPhase) {
      return false;
    }

    return true;
  });

  // Group ads by phase for overview (filtered by selected brand)
  const adsForPhaseCount = selectedBrand 
    ? ads.filter(ad => ad.brandId === selectedBrand.id)
    : ads;
    
  const adsByPhase = FRAMEWORK_PHASES.map((phase) => ({
    phase,
    count: adsForPhaseCount.filter((ad) => ad.frameworkPhase === phase.id).length,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Library className="w-8 h-8 text-orange-500" />
            Ad Library
            {selectedBrand && (
              <Badge className="ml-2 bg-orange-500/20 text-orange-500 border-orange-500/50">
                {selectedBrand.name}
              </Badge>
            )}
          </h1>
          <p className="text-neutral-400 mt-1">
            {selectedBrand 
              ? `Viewing ads for ${selectedBrand.name}`
              : "Save and analyze ads for creative inspiration"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Meta Ads Library Link for selected brand */}
          {selectedBrand?.metaAdsLibraryUrl && (
            <a
              href={selectedBrand.metaAdsLibraryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Meta Ads Library
              </Button>
            </a>
          )}
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ad
          </Button>
        </div>
      </div>

      {/* Phase Overview */}
      <div className="grid grid-cols-5 gap-3">
        {adsByPhase.map(({ phase, count }) => (
          <Card
            key={phase.id}
            className={cn(
              "bg-neutral-900 border-neutral-800 cursor-pointer transition-all hover:scale-105",
              selectedPhase === phase.id && "border-orange-500"
            )}
            onClick={() =>
              setSelectedPhase(selectedPhase === phase.id ? "all" : phase.id)
            }
          >
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center bg-gradient-to-r",
                  phase.color
                )}
              >
                <span className="text-white font-bold text-lg">{count}</span>
              </div>
              <p className="text-sm font-medium text-white">{phase.name}</p>
              <p className="text-xs text-neutral-500">{phase.percentage}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Search ads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>

            {/* Phase Filter */}
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="All Phases" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="all" className="text-white">
                  All Phases
                </SelectItem>
                {FRAMEWORK_PHASES.map((phase) => (
                  <SelectItem
                    key={phase.id}
                    value={phase.id}
                    className="text-white"
                  >
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

            {/* Clear Filters */}
            {(searchQuery || selectedPhase !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPhase("all");
                }}
                className="text-neutral-400"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Selected Brand Info */}
          {selectedBrand && (
            <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <p className="text-sm text-neutral-400">
                Showing ads for <span className="text-white font-medium">{selectedBrand.name}</span>
                {" "}• Use sidebar to switch brands
              </p>
              {selectedBrand.metaAdsLibraryUrl && (
                <a
                  href={selectedBrand.metaAdsLibraryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Meta Ads Library
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ads Grid */}
      {filteredAds.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Library className="w-16 h-16 text-neutral-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {ads.length === 0 
                ? "No ads saved yet" 
                : selectedBrand
                  ? `No ads for ${selectedBrand.name}`
                  : "No ads match your filters"
              }
            </h3>
            <p className="text-neutral-400 text-center max-w-md mb-6">
              {ads.length === 0
                ? "Start building your ad library by saving ads from Meta Ads Library or uploading screenshots."
                : selectedBrand
                  ? `Add some ads for ${selectedBrand.name} to track their creative strategy.`
                  : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {(ads.length === 0 || selectedBrand) && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedBrand ? `Add Ad for ${selectedBrand.name}` : "Add Your First Ad"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAds.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              onDelete={handleDeleteAd}
              onAnalyze={handleAnalyzeAd}
              onClick={setSelectedAd}
            />
          ))}
        </div>
      )}

      {/* Add Ad Dialog - pass selected brand as default */}
      <AddAdDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        brands={allBrands}
        defaultBrandId={selectedBrand?.id}
        onAdCreated={fetchData}
      />

      {/* Ad Detail Dialog */}
      {selectedAd && (
        <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
          <DialogContent className="bg-neutral-900 border-neutral-800 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {selectedAd.brandName}
                <Badge
                  className={cn(
                    "ml-2 border-0 text-white bg-gradient-to-r",
                    FRAMEWORK_PHASES.find((p) => p.id === selectedAd.frameworkPhase)
                      ?.color
                  )}
                >
                  {selectedAd.frameworkPhase}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                {selectedAd.format} ad • Added{" "}
                {new Date(selectedAd.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Image */}
                {selectedAd.imageData && (
                  <div className="rounded-lg overflow-hidden bg-neutral-800">
                    <img
                      src={selectedAd.imageData}
                      alt={selectedAd.brandName}
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}

                {/* Hook */}
                {selectedAd.hook && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-1">
                      Hook
                    </h4>
                    <p className="text-lg font-semibold text-orange-400">
                      &ldquo;{selectedAd.hook}&rdquo;
                    </p>
                  </div>
                )}

                {/* Ad Copy */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-1">
                    Ad Copy
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedAd.adCopy}
                  </p>
                </div>

                {/* CTA */}
                {selectedAd.cta && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-1">
                      Call to Action
                    </h4>
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      {selectedAd.cta}
                    </Badge>
                  </div>
                )}

                {/* AI Analysis */}
                {selectedAd.aiAnalysis && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Analysis
                    </h4>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-neutral-300 text-sm">
                        {selectedAd.aiAnalysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedAd.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAd.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-neutral-800 text-neutral-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Link */}
                {selectedAd.metaAdsLibraryUrl && (
                  <div>
                    <a
                      href={selectedAd.metaAdsLibraryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-500 hover:underline"
                    >
                      View in Meta Ads Library →
                    </a>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-neutral-800">
              <Button
                variant="outline"
                onClick={() => handleAnalyzeAd(selectedAd)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteAd(selectedAd.id);
                  setSelectedAd(null);
                }}
              >
                Delete Ad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
