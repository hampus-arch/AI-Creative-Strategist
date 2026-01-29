import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all brands for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new brand
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, websiteUrl, scrapedContent, targetAudience, painPoints, uniqueSellingPoints } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        userId: session.user.id,
        name,
        description,
        websiteUrl,
        scrapedContent,
        targetAudience,
        painPoints,
        uniqueSellingPoints,
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
