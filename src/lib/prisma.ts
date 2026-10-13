import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

let dbUrl: string | undefined = process.env.DATABASE_URL;

// On Vercel / serverless runtime, copy bundled SQLite database to writable /tmp directory
if (process.env.VERCEL) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (!fs.existsSync(tmpDbPath)) {
    if (fs.existsSync(bundledDbPath)) {
      try {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
        console.log("Copied SQLite dev.db to /tmp/dev.db");
      } catch (err) {
        console.error("Error copying dev.db to /tmp:", err);
      }
    }
  }

  if (fs.existsSync(tmpDbPath)) {
    dbUrl = `file:${tmpDbPath}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
