import { NextRequest, NextResponse } from "next/server";
import { getMockSettings } from "@/lib/mock-data";
import { generateImage, generateImageWithImagen, type AspectRatio, type ImageStyle } from "@/lib/gemini";

// Helper to get Gemini API key from headers or fallback
function getGeminiApiKey(req: NextRequest): string | null {
  // Try header first (from localStorage)
  const headerKey = req.headers.get("x-gemini-api-key");
  if (headerKey) return headerKey;

  // Fallback to mock settings
  const settings = getMockSettings();
  if (settings.geminiApiKey) return settings.geminiApiKey;

  // Fallback to environment variable
  return process.env.GEMINI_API_KEY || null;
}

export async function POST(req: NextRequest) {
  try {
    const geminiApiKey = getGeminiApiKey(req);

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add your Gemini API key in Settings." },
        { status: 400 }
      );
    }

    const { prompt, aspectRatio, style, negativePrompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let result;
    let error;

    // Try Gemini 2.0 Flash first (has native image generation)
    try {
      result = await generateImage(geminiApiKey, {
        prompt,
        aspectRatio: aspectRatio as AspectRatio,
        style: style as ImageStyle,
        negativePrompt,
      });
    } catch (e) {
      error = e;
      console.log("Gemini 2.0 Flash failed, trying Imagen...");
    }

    // If that fails, try Imagen 3
    if (!result) {
      try {
        result = await generateImageWithImagen(geminiApiKey, {
          prompt,
          aspectRatio: aspectRatio as AspectRatio,
          style: style as ImageStyle,
        });
      } catch (e) {
        error = e;
        console.error("Both image generation methods failed:", error);
      }
    }

    if (!result) {
      return NextResponse.json(
        { 
          error: error instanceof Error 
            ? error.message 
            : "Failed to generate image. Please try again." 
        },
        { status: 500 }
      );
    }

    // Return the image as base64 data URL
    const imageUrl = `data:${result.mimeType};base64,${result.base64Data}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
