import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Role } from "./types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_dev_32char_minimum";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_dev_32char_minimum";

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Generates random secure token and its SHA256 hash for database storage
export function generateOpaqueToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const COOKIE_OPTIONS = {
  accessToken: {
    name: "access_token",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    },
  },
  refreshToken: (rememberMe: boolean = false) => ({
    name: "refresh_token",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : undefined, // 7 days or session
    },
  }),
};
