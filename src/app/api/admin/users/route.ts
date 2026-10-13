import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN";
}

// GET /api/admin/users - List and search users
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { username: { contains: search } },
                { email: { contains: search } },
                { name: { contains: search } },
              ],
            }
          : {},
        role ? { role: role as "USER" | "ADMIN" } : {},
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
