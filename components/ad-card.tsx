"use client";

import { cn } from "@/lib/utils";
import { type SavedAd } from "@/lib/mock-data";
import { FRAMEWORK_PHASES } from "@/lib/framework";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Image as ImageIcon,
  Video,
  Layers,
  Sparkles,
} from "lucide-react";

interface AdCardProps {
  ad: SavedAd;
  onDelete?: (id: string) => void;
  onAnalyze?: (ad: SavedAd) => void;
  onClick?: (ad: SavedAd) => void;
}

const formatIcons = {
  image: ImageIcon,
  video: Video,
  carousel: Layers,
};

export function AdCard({ ad, onDelete, onAnalyze, onClick }: AdCardProps) {
  const phase = FRAMEWORK_PHASES.find((p) => p.id === ad.frameworkPhase);
  const FormatIcon = formatIcons[ad.format];

  return (
    <Card
      className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all group cursor-pointer overflow-hidden"
      onClick={() => onClick?.(ad)}
    >
      {/* Image Preview */}
      <div className="relative aspect-square bg-neutral-800 overflow-hidden">
        {ad.imageData ? (
          <img
            src={ad.imageData}
            alt={ad.brandName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <FormatIcon className="w-12 h-12" />
          </div>
        )}

        {/* Format badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm">
            <FormatIcon className="w-3 h-3 mr-1" />
            {ad.format}
          </Badge>
        </div>

        {/* Phase badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={cn(
              "border-0 text-white bg-gradient-to-r",
              phase?.color || "from-orange-500 to-orange-600"
            )}
          >
            {phase?.name || ad.frameworkPhase}
          </Badge>
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {ad.metaAdsLibraryUrl && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation();
                window.open(ad.metaAdsLibraryUrl, "_blank");
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Original
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Brand & Menu */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white truncate flex-1">
            {ad.brandName}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
              {onAnalyze && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze(ad);
                  }}
                  className="text-white focus:bg-orange-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analyze
                </DropdownMenuItem>
              )}
              {ad.metaAdsLibraryUrl && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(ad.metaAdsLibraryUrl, "_blank");
                  }}
                  className="text-white focus:bg-neutral-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Meta
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(ad.id);
                  }}
                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hook preview */}
        {ad.hook && (
          <p className="text-sm text-orange-400 font-medium mb-2 line-clamp-1">
            &ldquo;{ad.hook}&rdquo;
          </p>
        )}

        {/* Ad copy preview */}
        <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
          {ad.adCopy}
        </p>

        {/* Tags */}
        {ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ad.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-neutral-700 text-neutral-400"
              >
                {tag}
              </Badge>
            ))}
            {ad.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs border-neutral-700 text-neutral-400"
              >
                +{ad.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
