import { NextRequest, NextResponse } from "next/server";
import { getMockSettings, setMockSettings } from "@/lib/mock-data";
import { validateApiKey } from "@/lib/openai";

// GET user settings
export async function GET() {
  try {
    const settings = getMockSettings();
    return NextResponse.json({
      hasApiKey: settings.hasApiKey,
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
    const { apiKey, preferredModel } = await req.json();

    // If updating API key, validate it first
    if (apiKey) {
      const isValid = await validateApiKey(apiKey);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 400 }
        );
      }
    }

    setMockSettings({ apiKey, preferredModel });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
