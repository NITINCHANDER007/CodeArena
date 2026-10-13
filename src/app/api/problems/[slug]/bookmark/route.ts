import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

// POST /api/problems/[slug]/bookmark - Toggle bookmark for current user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const accessToken = req.cookies.get("access_token")?.value;
    const payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      return NextResponse.json({ error: "Please log in to bookmark problems." }, { status: 401 });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: payload.userId,
          problemId: problem.id,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isBookmarked: false, message: "Removed from favorites" });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: payload.userId,
          problemId: problem.id,
        },
      });
      return NextResponse.json({ isBookmarked: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Bookmark toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
