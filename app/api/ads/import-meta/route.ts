import { NextRequest, NextResponse } from "next/server";
import { addMockAd, type SavedAd } from "@/lib/mock-data";
import { getApiKeysForRequest } from "@/lib/api-keys";
import { getMockSettings } from "@/lib/mock-data";
import { FRAMEWORK_PHASES, type FrameworkPhase } from "@/lib/framework";

interface ImportAd {
  imageData: string; // Base64 image
  adCopy?: string;
  metaUrl?: string;
  brandId?: string;
  brandName: string;
}

// Helper to analyze ad with AI (reuse the analyze endpoint logic)
async function analyzeAdWithAI(
  imageData: string,
  adCopy: string,
  apiKey: string,
  req: NextRequest
): Promise<{
  hook?: string;
  cta?: string;
  frameworkPhase: FrameworkPhase;
  tags: string[];
  analysis?: string;
}> {
  try {
    // Create a new request with the API key in headers
    const analyzeReq = new NextRequest(new URL("/api/ads/analyze", req.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-openai-api-key": apiKey,
      },
      body: JSON.stringify({ imageData, adCopy }),
    });

    // Import and call the analyze handler directly
    const { POST: analyzeHandler } = await import("../analyze/route");
    const response = await analyzeHandler(analyzeReq);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed");
    }

    return {
      hook: data.analysis?.hook,
      cta: data.analysis?.cta,
      frameworkPhase: data.analysis?.frameworkPhase || "INTERRUPT",
      tags: data.analysis?.tags || [],
      analysis: data.analysis?.analysis,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    // Return defaults if analysis fails
    return {
      frameworkPhase: "INTERRUPT",
      tags: ["imported"],
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ads, brandId, brandName } = await req.json() as {
      ads: ImportAd[];
      brandId?: string;
      brandName: string;
    };

    if (!ads || !Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json(
        { error: "No ads provided" },
        { status: 400 }
      );
    }

    // Get API key for AI analysis
    const headerKey = req.headers.get("x-openai-api-key");
    const settings = getMockSettings();
    const apiKey = headerKey || settings.apiKey || process.env.OPENAI_API_KEY || "";

    const importedAds: SavedAd[] = [];
    const errors: string[] = [];

    // Process ads in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < ads.length; i += batchSize) {
      const batch = ads.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (ad) => {
          try {
            // Analyze with AI if we have an API key
            let analysisResult: {
              hook?: string;
              cta?: string;
              frameworkPhase: FrameworkPhase;
              tags: string[];
              analysis?: string;
            } = {
              hook: ad.adCopy?.split("\n")[0]?.slice(0, 100),
              cta: undefined,
              frameworkPhase: "INTERRUPT",
              tags: ["imported", "meta-ads-library"],
              analysis: undefined,
            };

            if (apiKey && ad.imageData && ad.adCopy) {
              try {
                const aiResult = await analyzeAdWithAI(
                  ad.imageData,
                  ad.adCopy,
                  apiKey,
                  req
                );
                analysisResult = {
                  hook: aiResult.hook || analysisResult.hook,
                  cta: aiResult.cta,
                  frameworkPhase: aiResult.frameworkPhase,
                  tags: aiResult.tags.length > 0 ? aiResult.tags : analysisResult.tags,
                  analysis: aiResult.analysis,
                };
              } catch (error) {
                console.error("Analysis failed for ad:", error);
                // Continue with defaults
              }
            }

            const savedAd = addMockAd({
              brandId: ad.brandId || brandId,
              brandName: ad.brandName || brandName,
              imageData: ad.imageData,
              adCopy: ad.adCopy || "No ad copy provided",
              hook: analysisResult.hook,
              cta: analysisResult.cta,
              format: "image",
              frameworkPhase: analysisResult.frameworkPhase,
              metaAdsLibraryUrl: ad.metaUrl,
              aiAnalysis: analysisResult.analysis,
              tags: analysisResult.tags,
            });

            importedAds.push(savedAd);
          } catch (error) {
            errors.push(`Failed to import ad ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < ads.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedAds.length,
      total: ads.length,
      ads: importedAds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
