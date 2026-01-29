import { NextResponse } from "next/server";
import { getMockSettings } from "@/lib/mock-data";
import { getAvailableModels } from "@/lib/openai";

export async function GET() {
  try {
    const settings = getMockSettings();

    if (!settings.apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 400 }
      );
    }

    const models = await getAvailableModels(settings.apiKey);
    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
