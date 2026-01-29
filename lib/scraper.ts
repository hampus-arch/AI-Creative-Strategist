import * as cheerio from "cheerio";

export interface ScrapedData {
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  keywords: string[];
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CreativeStrategistBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $("script, style, nav, footer, header, noscript, iframe").remove();

    // Extract title
    const title = $("title").text().trim() || 
                  $('meta[property="og:title"]').attr("content") || 
                  $("h1").first().text().trim() || "";

    // Extract description
    const description = $('meta[name="description"]').attr("content") ||
                       $('meta[property="og:description"]').attr("content") || "";

    // Extract headings
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2 && text.length < 200) {
        headings.push(text);
      }
    });

    // Extract main paragraphs
    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 50 && text.length < 1000) {
        paragraphs.push(text);
      }
    });

    // Extract keywords
    const keywordsAttr = $('meta[name="keywords"]').attr("content");
    const keywords = keywordsAttr 
      ? keywordsAttr.split(",").map(k => k.trim()).filter(k => k)
      : [];

    return {
      title,
      description,
      headings: headings.slice(0, 10),
      paragraphs: paragraphs.slice(0, 5),
      keywords: keywords.slice(0, 10),
    };
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  }
}

export function formatScrapedContent(data: ScrapedData): string {
  const sections: string[] = [];

  if (data.title) {
    sections.push(`# ${data.title}`);
  }

  if (data.description) {
    sections.push(`## Description\n${data.description}`);
  }

  if (data.headings.length > 0) {
    sections.push(`## Key Headings\n${data.headings.map(h => `- ${h}`).join("\n")}`);
  }

  if (data.paragraphs.length > 0) {
    sections.push(`## Content Excerpts\n${data.paragraphs.join("\n\n")}`);
  }

  if (data.keywords.length > 0) {
    sections.push(`## Keywords\n${data.keywords.join(", ")}`);
  }

  return sections.join("\n\n");
}
