import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { Difficulty } from "@/lib/types";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/problems - List all problems with test case counts and tags
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const problems = await prisma.problem.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { orderIndex: "asc" },
    include: {
      tags: { include: { tag: true } },
      _count: {
        select: {
          testCases: true,
          submissions: true,
        },
      },
    },
  });

  return NextResponse.json({ problems });
}

// POST /api/admin/problems - Create a new problem
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      slug,
      description,
      difficulty,
      isPublished = true,
      timeLimitMs = 2000,
      memoryLimitMb = 256,
      orderIndex = 0,
      tagIds = [],
      starterCodes = [],
    } = body;

    if (!title || !slug || !description || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.problem.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Problem with this slug already exists" }, { status: 409 });
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        description,
        difficulty: difficulty as Difficulty,
        isPublished,
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb),
        orderIndex: Number(orderIndex),
        tags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
        starterCodes: {
          create: starterCodes.map((sc: { languageId: string; code: string }) => ({
            languageId: sc.languageId,
            code: sc.code,
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        starterCodes: true,
      },
    });

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error("Create problem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
