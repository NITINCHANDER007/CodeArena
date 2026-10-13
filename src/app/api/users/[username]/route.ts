import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
        isBanned: true,
      },
    });

    if (!user || user.isBanned) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Catalog totals
    const [totalEasy, totalMedium, totalHard] = await Promise.all([
      prisma.problem.count({ where: { difficulty: "EASY", isPublished: true } }),
      prisma.problem.count({ where: { difficulty: "MEDIUM", isPublished: true } }),
      prisma.problem.count({ where: { difficulty: "HARD", isPublished: true } }),
    ]);

    // User submissions
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        problem: {
          select: { id: true, title: true, slug: true, difficulty: true },
        },
        language: { select: { name: true } },
      },
    });

    // Compute unique solved problems
    const solvedEasy = new Set<string>();
    const solvedMedium = new Set<string>();
    const solvedHard = new Set<string>();

    submissions.forEach((s) => {
      if (s.status === "ACCEPTED") {
        if (s.problem.difficulty === "EASY") solvedEasy.add(s.problem.id);
        if (s.problem.difficulty === "MEDIUM") solvedMedium.add(s.problem.id);
        if (s.problem.difficulty === "HARD") solvedHard.add(s.problem.id);
      }
    });

    const totalSolved = solvedEasy.size + solvedMedium.size + solvedHard.size;
    const totalSubmissions = submissions.length;
    const acceptedCount = submissions.filter((s) => s.status === "ACCEPTED").length;
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedCount / totalSubmissions) * 100 * 10) / 10
        : 0;

    // Streak calculation (days with at least 1 accepted submission)
    const activeDates = new Set(
      submissions
        .filter((s) => s.status === "ACCEPTED")
        .map((s) => new Date(s.createdAt).toISOString().split("T")[0])
    );

    let streak = 0;
    const cursor = new Date();
    while (true) {
      const dateStr = cursor.toISOString().split("T")[0];
      if (activeDates.has(dateStr)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        // If today has no submission yet, check yesterday
        if (streak === 0) {
          cursor.setDate(cursor.getDate() - 1);
          const yesterdayStr = cursor.toISOString().split("T")[0];
          if (activeDates.has(yesterdayStr)) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        streak,
        stats: {
          totalSolved,
          totalProblems: totalEasy + totalMedium + totalHard,
          acceptanceRate,
          totalSubmissions,
          easy: { solved: solvedEasy.size, total: totalEasy },
          medium: { solved: solvedMedium.size, total: totalMedium },
          hard: { solved: solvedHard.size, total: totalHard },
        },
        recentSubmissions: submissions.slice(0, 15),
      },
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
