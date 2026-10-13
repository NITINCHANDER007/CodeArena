import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { Difficulty } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status"); // "solved" | "unsolved" | "bookmarked" | ""
    const company = searchParams.get("company");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    // Identify user if logged in
    const accessToken = req.cookies.get("access_token")?.value;
    const userPayload = accessToken ? verifyAccessToken(accessToken) : null;
    const userId = userPayload?.userId;

    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      where.difficulty = difficulty as Difficulty;
    }

    if (company) {
      where.companies = { contains: company };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    // Get solved problem IDs and bookmarked problem IDs if user is logged in
    let solvedProblemIds = new Set<string>();
    let bookmarkedProblemIds = new Set<string>();

    if (userId) {
      const [solvedSubs, bookmarks] = await Promise.all([
        prisma.submission.findMany({
          where: {
            userId,
            status: "ACCEPTED",
          },
          select: { problemId: true },
          distinct: ["problemId"],
        }),
        prisma.bookmark.findMany({
          where: { userId },
          select: { problemId: true },
        }),
      ]);

      solvedProblemIds = new Set(solvedSubs.map((s) => s.problemId));
      bookmarkedProblemIds = new Set(bookmarks.map((b) => b.problemId));

      if (status === "solved") {
        where.id = { in: Array.from(solvedProblemIds) };
      } else if (status === "unsolved") {
        where.id = { notIn: Array.from(solvedProblemIds) };
      } else if (status === "bookmarked") {
        where.id = { in: Array.from(bookmarkedProblemIds) };
      }
    } else if (status === "bookmarked" || status === "solved") {
      // Not logged in but requesting user-specific filter
      where.id = { in: [] };
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { orderIndex: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          _count: {
            select: { submissions: true },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    // Calculate acceptance rate per problem
    const problemsWithMeta = await Promise.all(
      problems.map(async (p) => {
        const acceptedCount = await prisma.submission.count({
          where: { problemId: p.id, status: "ACCEPTED" },
        });
        const totalSubs = p._count.submissions;
        const acceptanceRate =
          totalSubs > 0 ? Math.round((acceptedCount / totalSubs) * 100 * 10) / 10 : 0;

        const companyList = p.companies
          ? p.companies.split(",").map((c) => c.trim()).filter(Boolean)
          : [];

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          orderIndex: p.orderIndex,
          companies: companyList,
          tags: p.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug })),
          totalSubmissions: totalSubs,
          acceptanceRate,
          isSolved: solvedProblemIds.has(p.id),
          isBookmarked: bookmarkedProblemIds.has(p.id),
        };
      })
    );

    return NextResponse.json({
      problems: problemsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List problems error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
