import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

// GET /api/problems/[slug]/discussions - List discussions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const discussions = await prisma.discussion.findMany({
      where: { problemId: problem.id },
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ discussions });
  } catch (error) {
    console.error("Get discussions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/problems/[slug]/discussions - Create a discussion
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const accessToken = req.cookies.get("access_token")?.value;
    const payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      return NextResponse.json({ error: "Please log in to post solutions." }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        problemId: problem.id,
        userId: payload.userId,
        title,
        content,
      },
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ discussion }, { status: 201 });
  } catch (error) {
    console.error("Create discussion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
