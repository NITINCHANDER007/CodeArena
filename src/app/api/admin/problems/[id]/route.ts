import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { Difficulty } from "@/lib/types";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/problems/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      starterCodes: { include: { language: true } },
      testCases: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  return NextResponse.json({ problem });
}

// PUT /api/admin/problems/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      description,
      difficulty,
      isPublished,
      timeLimitMs,
      memoryLimitMb,
      orderIndex,
      tagIds,
      starterCodes,
    } = body;

    // Check existing
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Update tags if provided
    if (Array.isArray(tagIds)) {
      await prisma.problemTag.deleteMany({ where: { problemId: id } });
      await prisma.problemTag.createMany({
        data: tagIds.map((tagId: string) => ({ problemId: id, tagId })),
      });
    }

    // Update starter codes if provided
    if (Array.isArray(starterCodes)) {
      for (const sc of starterCodes) {
        await prisma.starterCode.upsert({
          where: {
            problemId_languageId: {
              problemId: id,
              languageId: sc.languageId,
            },
          },
          update: { code: sc.code },
          create: {
            problemId: id,
            languageId: sc.languageId,
            code: sc.code,
          },
        });
      }
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(difficulty && { difficulty: difficulty as Difficulty }),
        ...(typeof isPublished === "boolean" && { isPublished }),
        ...(timeLimitMs && { timeLimitMs: Number(timeLimitMs) }),
        ...(memoryLimitMb && { memoryLimitMb: Number(memoryLimitMb) }),
        ...(typeof orderIndex === "number" && { orderIndex }),
      },
      include: {
        tags: { include: { tag: true } },
        starterCodes: true,
      },
    });

    return NextResponse.json({ problem: updated });
  } catch (error) {
    console.error("Update problem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/problems/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.problem.delete({ where: { id } });
    return NextResponse.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Delete problem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
