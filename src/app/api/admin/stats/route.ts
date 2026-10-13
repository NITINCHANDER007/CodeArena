import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;
    const payload = accessToken ? verifyAccessToken(accessToken) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      acceptedSubmissions,
      recentSubmissions,
      difficultyCounts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "ACCEPTED" } }),
      prisma.submission.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true } },
          problem: { select: { id: true, title: true, slug: true } },
          language: { select: { name: true } },
        },
      }),
      prisma.problem.groupBy({
        by: ["difficulty"],
        _count: { id: true },
      }),
    ]);

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100 * 10) / 10
        : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
      },
      difficultyCounts,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
