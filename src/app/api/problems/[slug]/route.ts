import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [problem, allLanguages] = await Promise.all([
      prisma.problem.findUnique({
        where: { slug, isPublished: true },
        include: {
          tags: { include: { tag: true } },
          starterCodes: {
            include: { language: true },
          },
          // SECURITY: Exclude hidden evaluation test cases; only expose sample tests
          testCases: {
            where: { isHidden: false },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              input: true,
              expectedOutput: true,
              isSample: true,
              orderIndex: true,
              explanation: true,
            },
          },
        },
      }),
      prisma.language.findMany({
        where: { isEnabled: true },
        orderBy: { name: "asc" },
      }),
    ]);

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const accessToken = req.cookies.get("access_token")?.value;
    const userPayload = accessToken ? (await import("@/lib/tokens")).verifyAccessToken(accessToken) : null;
    let isBookmarked = false;
    if (userPayload) {
      const bm = await prisma.bookmark.findUnique({
        where: {
          userId_problemId: {
            userId: userPayload.userId,
            problemId: problem.id,
          },
        },
      });
      isBookmarked = Boolean(bm);
    }

    return NextResponse.json({ problem, allLanguages, isBookmarked });
  } catch (error) {
    console.error("Get problem detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
