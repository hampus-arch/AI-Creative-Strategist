import { NextRequest } from "next/server";
import { getMockSettings } from "@/lib/mock-data";
import { createOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

// Helper to get API key from headers or fallback
function getApiKey(req: NextRequest): string | null {
  // Try header first (from localStorage)
  const headerKey = req.headers.get("x-openai-api-key");
  if (headerKey) return headerKey;

  // Fallback to mock settings
  const settings = getMockSettings();
  if (settings.apiKey) return settings.apiKey;

  // Fallback to environment variable
  return process.env.OPENAI_API_KEY || null;
}

// Helper to get preferred model
function getPreferredModel(req: NextRequest): string {
  const headerModel = req.headers.get("x-preferred-model");
  if (headerModel) return headerModel;

  const settings = getMockSettings();
  return settings.preferredModel || "gpt-4o";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured. Please add your OpenAI API key in Settings." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, frameworkPhase, contentType } = await req.json();

    // Create OpenAI client with user's API key
    const openai = createOpenAIClient(apiKey);
    const model = getPreferredModel(req);

    // System prompt based on framework
    const systemPrompt = `You are an expert AI Creative Strategist specialized in direct response marketing and the Orange Juice Creative Framework.

Your role is to help create high-converting ad content for Facebook and other platforms.

Framework Phase: ${frameworkPhase}
Content Type: ${contentType}

Guidelines:
- Be specific and actionable in your suggestions
- Use direct response copywriting principles
- Focus on emotional triggers and psychological principles
- Provide content that can be immediately used or adapted
- Be creative and think outside the box
- Format your responses clearly with headings and bullet points when appropriate`;

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    // Create a readable stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
