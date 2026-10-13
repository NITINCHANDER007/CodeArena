import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/languages
export async function GET(req: NextRequest) {
  const languages = await prisma.language.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ languages });
}

// PUT /api/admin/languages - Toggle enabled or update judge0Id
export async function PUT(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, isEnabled, judge0Id, version } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing language ID" }, { status: 400 });

    const updated = await prisma.language.update({
      where: { id },
      data: {
        ...(typeof isEnabled === "boolean" && { isEnabled }),
        ...(judge0Id && { judge0Id: Number(judge0Id) }),
        ...(version && { version }),
      },
    });

    return NextResponse.json({ language: updated });
  } catch (error) {
    console.error("Update language error:", error);
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }
}
