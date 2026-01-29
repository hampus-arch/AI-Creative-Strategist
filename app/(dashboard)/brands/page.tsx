"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Building2, Globe, Loader2, Trash2, ExternalLink } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  createdAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scrapedContent, setScrapedContent] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!websiteUrl) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsScraping(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to scrape website");
        return;
      }

      setScrapedContent(data.formattedContent);
      
      // Auto-fill description if empty
      if (!description && data.data.description) {
        setDescription(data.data.description);
      }
      
      // Auto-fill name if empty
      if (!name && data.data.title) {
        setName(data.data.title.split(" - ")[0].split(" | ")[0]);
      }

      toast.success("Website analyzed successfully!");
    } catch {
      toast.error("Failed to analyze website");
    } finally {
      setIsScraping(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          websiteUrl,
          scrapedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create brand");
        return;
      }

      toast.success("Brand created successfully!");
      setIsDialogOpen(false);
      resetForm();
      fetchBrands();
    } catch {
      toast.error("Failed to create brand");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete brand");
        return;
      }

      toast.success("Brand deleted");
      fetchBrands();
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setWebsiteUrl("");
    setScrapedContent("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Brands</h1>
          <p className="text-neutral-400 mt-1">
            Manage your brands and their information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Brand</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Enter your brand details or import from your website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Website URL with Scrape */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://yourbrand.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleScrape}
                    disabled={isScraping}
                    variant="outline"
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  >
                    {isScraping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  We&apos;ll extract key information from your website
                </p>
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Brand Name *</Label>
                <Input
                  placeholder="Your Brand Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-neutral-300">Description</Label>
                <Textarea
                  placeholder="Describe your brand, products, and target audience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-neutral-800 border-neutral-700 text-white resize-none"
                />
              </div>

              {/* Scraped Content Preview */}
              {scrapedContent && (
                <div className="space-y-2">
                  <Label className="text-neutral-300">Extracted Content</Label>
                  <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-neutral-400 whitespace-pre-wrap">
                      {scrapedContent}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="border-neutral-700 text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBrand}
                  disabled={isCreating}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Brand
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No brands yet</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Add your first brand to start generating content
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        {brand.name}
                      </CardTitle>
                      {brand.websiteUrl && (
                        <a
                          href={brand.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-500 hover:text-orange-500 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {brand.websiteUrl.replace(/https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-neutral-400 line-clamp-2 mb-4">
                  {brand.description || "No description"}
                </CardDescription>
                <Link href={`/generate?brand=${brand.id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-neutral-700 text-neutral-300 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50"
                  >
                    Generate Content
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
