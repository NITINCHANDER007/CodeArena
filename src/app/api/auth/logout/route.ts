import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get("refresh_token")?.value;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      // Revoke in DB
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
    }

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
