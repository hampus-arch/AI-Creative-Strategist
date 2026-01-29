import { NextRequest, NextResponse } from "next/server";
import { getMockSettings, setMockSettings } from "@/lib/mock-data";
import { validateApiKey } from "@/lib/openai";
import { validateGeminiApiKey } from "@/lib/gemini";

// GET user settings
export async function GET() {
  try {
    const settings = getMockSettings();
    return NextResponse.json({
      hasApiKey: settings.hasApiKey,
      hasGeminiKey: settings.hasGeminiKey,
      preferredModel: settings.preferredModel,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST update settings
export async function POST(req: NextRequest) {
  try {
    const { apiKey, geminiApiKey, preferredModel } = await req.json();

    // If updating OpenAI API key, validate it first
    if (apiKey) {
      const isValid = await validateApiKey(apiKey);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key" },
          { status: 400 }
        );
      }
    }

    // If updating Gemini API key, validate it
    if (geminiApiKey) {
      const isValid = await validateGeminiApiKey(geminiApiKey);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Gemini API key" },
          { status: 400 }
        );
      }
    }

    setMockSettings({ apiKey, geminiApiKey, preferredModel });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
