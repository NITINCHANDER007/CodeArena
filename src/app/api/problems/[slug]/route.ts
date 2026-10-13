import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FALLBACK_PROBLEMS, FALLBACK_LANGUAGES } from "@/lib/problemsFallback";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
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

    if (problem) {
      const accessToken = req.cookies.get("access_token")?.value;
      const userPayload = accessToken ? (await import("@/lib/tokens")).verifyAccessToken(accessToken) : null;
      let isBookmarked = false;
      if (userPayload) {
        try {
          const bm = await prisma.bookmark.findUnique({
            where: {
              userId_problemId: {
                userId: userPayload.userId,
                problemId: problem.id,
              },
            },
          });
          isBookmarked = Boolean(bm);
        } catch {
          // ignore bookmark error
        }
      }

      return NextResponse.json({
        problem,
        allLanguages: allLanguages.length > 0 ? allLanguages : FALLBACK_LANGUAGES,
        isBookmarked,
      });
    }
  } catch (error) {
    console.warn("Database lookup failed, falling back to static problem definition:", error);
  }

  // Fallback to static problem definition if database is cold or unavailable
  if (FALLBACK_PROBLEMS[slug]) {
    return NextResponse.json({
      problem: FALLBACK_PROBLEMS[slug],
      allLanguages: FALLBACK_LANGUAGES,
      isBookmarked: false,
    });
  }

  return NextResponse.json({ error: "Problem not found" }, { status: 404 });
}
