import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateApiKey, getAvailableModels } from "@/lib/openai";

// GET user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        openaiApiKey: true,
        preferredModel: true,
      },
    });

    return NextResponse.json({
      hasApiKey: !!user?.openaiApiKey,
      preferredModel: user?.preferredModel || "gpt-4o",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST update settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const updateData: { openaiApiKey?: string; preferredModel?: string } = {};
    if (apiKey !== undefined) updateData.openaiApiKey = apiKey;
    if (preferredModel !== undefined) updateData.preferredModel = preferredModel;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
