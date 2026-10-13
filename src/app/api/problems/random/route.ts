import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });

    if (problems.length === 0) {
      return NextResponse.json({ error: "No problems found" }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * problems.length);
    const randomProblem = problems[randomIndex];

    return NextResponse.json({ slug: randomProblem.slug });
  } catch (error) {
    console.error("Random problem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
