import { NextRequest, NextResponse } from "next/server";
import { getMockSettings } from "@/lib/mock-data";
import { getAvailableModels } from "@/lib/openai";

// Helper to get API key from headers or fallback
function getApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get("x-openai-api-key");
  if (headerKey) return headerKey;

  const settings = getMockSettings();
  if (settings.apiKey) return settings.apiKey;

  return process.env.OPENAI_API_KEY || null;
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 400 }
      );
    }

    const models = await getAvailableModels(apiKey);
    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
