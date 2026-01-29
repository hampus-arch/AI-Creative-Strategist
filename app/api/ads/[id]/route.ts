import { NextRequest, NextResponse } from "next/server";
import { getMockAd, updateMockAd, deleteMockAd } from "@/lib/mock-data";

// GET single ad
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = getMockAd(id);

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT update ad
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const ad = updateMockAd(id, updates);

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE ad
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteMockAd(id);

    if (!deleted) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
