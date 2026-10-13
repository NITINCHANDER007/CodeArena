import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/tags
export async function GET(req: NextRequest) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { problems: true },
      },
    },
  });
  return NextResponse.json({ tags });
}

// POST /api/admin/tags
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json({ error: "Tag already exists or invalid" }, { status: 400 });
  }
}

// DELETE /api/admin/tags
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing tag ID" }, { status: 400 });

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
