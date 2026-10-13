import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/password";
import {
  signAccessToken,
  signRefreshToken,
  generateOpaqueToken,
  COOKIE_OPTIONS,
} from "@/lib/tokens";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Rate limiting per IP
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.resetInSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { identifier, password, rememberMe } = parsed.data;

    // Find user by email OR username
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Check account ban status
    if (user.isBanned) {
      return NextResponse.json(
        { error: `This account has been suspended. Reason: ${user.banReason || "Terms of service violation"}` },
        { status: 403 }
      );
    }

    // Check account lockout
    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      const waitMin = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / (60 * 1000));
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to repeated failed logins. Please try again in ${waitMin} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Check password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = newFailedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockUntil = isNowLocked ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: lockUntil,
        },
      });

      if (isNowLocked) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
          },
          { status: 423 }
        );
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
      return NextResponse.json(
        {
          error: `Invalid credentials. ${remainingAttempts} attempt(s) remaining before account lockout.`,
        },
        { status: 401 }
      );
    }

    // Password valid: reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Check email verification requirement (can warn or require; let's allow login but provide flag)
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as any,
    });

    // Generate refresh token and save token hash in DB
    const { rawToken: rawRefreshToken, tokenHash } = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        userAgent,
        ipAddress: ip,
        expiresAt,
      },
    });

    // Prepare response with httpOnly cookies
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    // Set Access Token cookie
    response.cookies.set(
      COOKIE_OPTIONS.accessToken.name,
      accessToken,
      COOKIE_OPTIONS.accessToken.options
    );

    // Set Refresh Token cookie (raw token)
    const refreshOpts = COOKIE_OPTIONS.refreshToken(rememberMe);
    response.cookies.set(refreshOpts.name, rawRefreshToken, refreshOpts.options);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
