import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashToken,
  signAccessToken,
  COOKIE_OPTIONS,
} from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get("refresh_token")?.value;

    if (!rawRefreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      // Invalidate cookie if invalid
      const response = NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    if (session.user.isBanned) {
      return NextResponse.json({ error: "User is suspended" }, { status: 403 });
    }

    // Generate new Access Token
    const newAccessToken = signAccessToken({
      userId: session.user.id,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role as any,
    });

    const response = NextResponse.json({
      message: "Token refreshed successfully",
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
        isVerified: session.user.isVerified,
      },
    });

    response.cookies.set(
      COOKIE_OPTIONS.accessToken.name,
      newAccessToken,
      COOKIE_OPTIONS.accessToken.options
    );

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
