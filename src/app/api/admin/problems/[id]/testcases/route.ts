import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/problems/[id]/testcases
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const testCases = await prisma.testCase.findMany({
    where: { problemId: id },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ testCases });
}

// POST /api/admin/problems/[id]/testcases - Create a testcase
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { input, expectedOutput, isSample = false, isHidden = false, orderIndex = 0, explanation } = body;

    if (input === undefined || expectedOutput === undefined) {
      return NextResponse.json({ error: "Input and Expected Output are required" }, { status: 400 });
    }

    const testCase = await prisma.testCase.create({
      data: {
        problemId: id,
        input,
        expectedOutput,
        isSample: Boolean(isSample),
        isHidden: Boolean(isHidden),
        orderIndex: Number(orderIndex),
        explanation,
      },
    });

    return NextResponse.json({ testCase }, { status: 201 });
  } catch (error) {
    console.error("Create test case error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/problems/[id]/testcases - Update a testcase
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { testCaseId, input, expectedOutput, isSample, isHidden, orderIndex, explanation } = body;

    if (!testCaseId) {
      return NextResponse.json({ error: "testCaseId is required" }, { status: 400 });
    }

    const updated = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        ...(input !== undefined && { input }),
        ...(expectedOutput !== undefined && { expectedOutput }),
        ...(isSample !== undefined && { isSample: Boolean(isSample) }),
        ...(isHidden !== undefined && { isHidden: Boolean(isHidden) }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
        ...(explanation !== undefined && { explanation }),
      },
    });

    return NextResponse.json({ testCase: updated });
  } catch (error) {
    console.error("Update test case error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/problems/[id]/testcases - Delete a testcase
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const testCaseId = searchParams.get("testCaseId");

    if (!testCaseId) {
      return NextResponse.json({ error: "testCaseId parameter is required" }, { status: 400 });
    }

    await prisma.testCase.delete({ where: { id: testCaseId } });
    return NextResponse.json({ message: "Test case deleted successfully" });
  } catch (error) {
    console.error("Delete test case error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
