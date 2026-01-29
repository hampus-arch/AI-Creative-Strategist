import { NextRequest, NextResponse } from "next/server";
import { getMockSettings, setMockSettings } from "@/lib/mock-data";

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
    const { apiKey, geminiApiKey, preferredModel, skipValidation } = await req.json();

    // Basic format validation only (no API calls that might fail)
    if (apiKey) {
      // OpenAI keys start with "sk-" and are at least 20 chars
      if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key format. Should start with 'sk-'" },
          { status: 400 }
        );
      }
    }

    if (geminiApiKey) {
      // Gemini keys start with "AIza" and are around 39 chars
      if (!geminiApiKey.startsWith("AIza") || geminiApiKey.length < 30) {
        return NextResponse.json(
          { error: "Invalid Gemini API key format. Should start with 'AIza'" },
          { status: 400 }
        );
      }
    }

    // Save the keys
    setMockSettings({ apiKey, geminiApiKey, preferredModel });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
