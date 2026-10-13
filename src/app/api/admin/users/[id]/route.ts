import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";

function checkAdmin(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? verifyAccessToken(accessToken) : null;
  return payload && payload.role === "ADMIN" ? payload : null;
}

// PUT /api/admin/users/[id] - Update user role or ban status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentAdmin = checkAdmin(req);
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { role, isBanned, banReason } = body;

    // Prevent admin from removing their own admin status or banning themselves
    if (id === currentAdmin.userId && (role === "USER" || isBanned === true)) {
      return NextResponse.json(
        { error: "You cannot demote or ban your own admin account." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(typeof isBanned === "boolean" && {
          isBanned,
          banReason: isBanned ? banReason || "Violated community rules" : null,
        }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        banReason: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentAdmin = checkAdmin(req);
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    if (id === currentAdmin.userId) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
