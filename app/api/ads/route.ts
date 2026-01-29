import { NextRequest, NextResponse } from "next/server";
import { getMockAds, addMockAd, searchMockAds, type SavedAd, type AdFormat } from "@/lib/mock-data";
import { FrameworkPhase } from "@/lib/framework";

// GET all ads or search/filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const brandId = searchParams.get("brandId");
    const phase = searchParams.get("phase") as FrameworkPhase | null;

    let ads = getMockAds();

    // Search if query provided
    if (query) {
      ads = searchMockAds(query);
    }

    // Filter by brand
    if (brandId) {
      ads = ads.filter((ad) => ad.brandId === brandId);
    }

    // Filter by phase
    if (phase) {
      ads = ads.filter((ad) => ad.frameworkPhase === phase);
    }

    // Sort by newest first
    ads = ads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new ad
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      brandId,
      brandName,
      imageData,
      adCopy,
      hook,
      cta,
      format,
      frameworkPhase,
      metaAdsLibraryUrl,
      aiAnalysis,
      tags,
    } = body;

    if (!brandName || !adCopy) {
      return NextResponse.json(
        { error: "Brand name and ad copy are required" },
        { status: 400 }
      );
    }

    const ad = addMockAd({
      brandId: brandId || undefined,
      brandName,
      imageData: imageData || undefined,
      adCopy,
      hook: hook || undefined,
      cta: cta || undefined,
      format: (format as AdFormat) || "image",
      frameworkPhase: (frameworkPhase as FrameworkPhase) || "INTERRUPT",
      metaAdsLibraryUrl: metaAdsLibraryUrl || undefined,
      aiAnalysis: aiAnalysis || undefined,
      tags: tags || [],
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
