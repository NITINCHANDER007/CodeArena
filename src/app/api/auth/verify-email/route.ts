import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get("token");

    if (!rawToken) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isVerified: true },
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: tokenRecord.id },
    });

    return NextResponse.json({
      message: "Email successfully verified! You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
