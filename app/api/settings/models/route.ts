import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAvailableModels } from "@/lib/openai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true },
    });

    if (!user?.openaiApiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 400 }
      );
    }

    const models = await getAvailableModels(user.openaiApiKey);
    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
