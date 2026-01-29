import { NextRequest, NextResponse } from "next/server";
import { getMockSettings } from "@/lib/mock-data";
import { createOpenAIClient } from "@/lib/openai";

// Helper to get API key from headers or fallback
function getApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get("x-openai-api-key");
  if (headerKey) return headerKey;

  const settings = getMockSettings();
  if (settings.apiKey) return settings.apiKey;

  return process.env.OPENAI_API_KEY || null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add your OpenAI API key in Settings." },
        { status: 400 }
      );
    }

    const { imageData, adCopy } = await req.json();

    if (!imageData && !adCopy) {
      return NextResponse.json(
        { error: "Either image or ad copy is required" },
        { status: 400 }
      );
    }

    const openai = createOpenAIClient(apiKey);

    const messages: Array<{
      role: "user";
      content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
    }> = [
      {
        role: "user",
        content: [],
      },
    ];

    // Build the prompt
    const analysisPrompt = `You are an expert ad creative analyst using the Orange Juice Creative Framework. Analyze this ad and provide:

1. **Hook**: Extract the main attention-grabbing hook (first line or visual hook)
2. **Ad Copy**: The full ad text/copy (if analyzing an image, extract visible text)
3. **CTA**: The call-to-action
4. **Framework Phase**: Which phase of the Orange Juice Framework does this ad belong to?
   - INTERRUPT (60%): Problem/Product awareness - surprise, contrast, identity resonance
   - EXPLAIN (20%): Education, differentiation - demos, how it works
   - OVERCOME (15%): Objection handling, trust - testimonials, social proof
   - PUSH (5%): Conversion - urgency, scarcity, offers
   - REENFORCE: Post-purchase - retention, referrals
5. **Format**: Is this an image, video, or carousel ad?
6. **Analysis**: What makes this ad work (or not work)? What psychological triggers does it use?
7. **Tags**: Suggest 3-5 relevant tags for categorization

Respond in JSON format:
{
  "hook": "extracted hook",
  "adCopy": "full ad copy",
  "cta": "call to action",
  "frameworkPhase": "INTERRUPT|EXPLAIN|OVERCOME|PUSH|REENFORCE",
  "format": "image|video|carousel",
  "analysis": "detailed analysis",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    messages[0].content.push({ type: "text", text: analysisPrompt });

    // Add image if provided
    if (imageData) {
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: imageData.startsWith("data:") ? imageData : `data:image/jpeg;base64,${imageData}`,
        },
      });
    }

    // Add ad copy context if provided
    if (adCopy) {
      messages[0].content.push({
        type: "text",
        text: `\n\nAd copy provided:\n${adCopy}`,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const analysis = JSON.parse(content);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze ad. Please try again." },
      { status: 500 }
    );
  }
}
