import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, hashToken, signAccessToken, COOKIE_OPTIONS } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            isVerified: true,
            isBanned: true,
            avatarUrl: true,
            createdAt: true,
          },
        });

        if (user && !user.isBanned) {
          return NextResponse.json({ user });
        }
      }
    }

    // Attempt recovery via refresh token if access token expired
    const rawRefreshToken = req.cookies.get("refresh_token")?.value;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const session = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (session && !session.revoked && session.expiresAt > new Date() && !session.user.isBanned) {
        const newAccessToken = signAccessToken({
          userId: session.user.id,
          email: session.user.email,
          username: session.user.username,
          role: session.user.role as any,
        });

        const response = NextResponse.json({
          user: {
            id: session.user.id,
            name: session.user.name,
            username: session.user.username,
            email: session.user.email,
            role: session.user.role,
            isVerified: session.user.isVerified,
            isBanned: session.user.isBanned,
            avatarUrl: session.user.avatarUrl,
            createdAt: session.user.createdAt,
          },
        });

        response.cookies.set(
          COOKIE_OPTIONS.accessToken.name,
          newAccessToken,
          COOKIE_OPTIONS.accessToken.options
        );

        return response;
      }
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ user: null });
  }
}
