import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scrapeWebsite, formatScrapedContent } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const scrapedData = await scrapeWebsite(url);
    const formattedContent = formatScrapedContent(scrapedData);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      formattedContent,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape website. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
