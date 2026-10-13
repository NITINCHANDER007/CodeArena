import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const accessToken = req.cookies.get("access_token")?.value;
    const payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      return NextResponse.json({ submissions: [] });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        problemId: problem.id,
        userId: payload.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        language: { select: { name: true } },
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Problem submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
