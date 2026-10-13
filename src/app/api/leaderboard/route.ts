import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch all non-banned users with their accepted submissions
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
        submissions: {
          select: {
            problemId: true,
            status: true,
            problem: {
              select: { difficulty: true },
            },
          },
        },
      },
    });

    // 2. Compute stats per user
    const leaderboard = users.map((u) => {
      const acceptedProblemMap = new Map<string, "EASY" | "MEDIUM" | "HARD">();
      let totalSubmissions = u.submissions.length;
      let totalAcceptedSubmissions = 0;

      u.submissions.forEach((sub) => {
        if (sub.status === "ACCEPTED") {
          totalAcceptedSubmissions += 1;
          acceptedProblemMap.set(sub.problemId, sub.problem.difficulty as any);
        }
      });

      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;

      acceptedProblemMap.forEach((diff) => {
        if (diff === "EASY") easySolved += 1;
        if (diff === "MEDIUM") mediumSolved += 1;
        if (diff === "HARD") hardSolved += 1;
      });

      const totalSolved = acceptedProblemMap.size;
      const acceptanceRate =
        totalSubmissions > 0
          ? Math.round((totalAcceptedSubmissions / totalSubmissions) * 100 * 10) / 10
          : 0;

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        joinedAt: u.createdAt,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSubmissions,
        acceptanceRate,
      };
    });

    // 3. Sort by totalSolved desc, then acceptanceRate desc
    leaderboard.sort((a, b) => {
      if (b.totalSolved !== a.totalSolved) {
        return b.totalSolved - a.totalSolved;
      }
      return b.acceptanceRate - a.acceptanceRate;
    });

    // 4. Assign ranks
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return NextResponse.json({ leaderboard: rankedLeaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
