import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { SubmissionStatus } from "@/lib/types";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const problemId = searchParams.get("problemId");
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;

  const where: any = {};
  if (status) where.status = status as SubmissionStatus;
  if (problemId) where.problemId = problemId;
  if (userId) where.userId = userId;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true, email: true } },
        problem: { select: { id: true, title: true, slug: true, difficulty: true } },
        language: { select: { name: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
