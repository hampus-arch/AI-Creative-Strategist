import { NextRequest, NextResponse } from "next/server";
import { getMockBrands, addMockBrand } from "@/lib/mock-data";

// GET all brands
export async function GET() {
  try {
    const brands = getMockBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new brand
export async function POST(req: NextRequest) {
  try {
    const { name, description, websiteUrl, scrapedContent, metaAdsLibraryUrl } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const brand = addMockBrand({
      name,
      description: description || null,
      websiteUrl: websiteUrl || null,
      scrapedContent: scrapedContent || null,
      metaAdsLibraryUrl: metaAdsLibraryUrl || null,
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
