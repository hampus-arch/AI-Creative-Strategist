import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true, preferredModel: true },
    });

    if (!user?.openaiApiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, brandId, frameworkPhase, contentType } = await req.json();

    // Create OpenAI client with user's API key
    const openai = createOpenAIClient(user.openaiApiKey);
    const model = user.preferredModel || "gpt-4o";

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

    // Save the conversation if brandId is provided
    if (brandId) {
      // We'll save after streaming completes on the client side
    }

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
