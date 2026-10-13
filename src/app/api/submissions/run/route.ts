import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { executeCodeOnJudge0 } from "@/lib/judge0";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, languageId, code, customInput } = body;

    if (!problemId || !languageId || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [problem, language] = await Promise.all([
      prisma.problem.findUnique({
        where: { id: problemId },
        include: {
          testCases: {
            where: { isHidden: false },
            orderBy: { orderIndex: "asc" },
            take: 3,
          },
        },
      }),
      prisma.language.findUnique({ where: { id: languageId } }),
    ]);

    if (!problem || !language) {
      return NextResponse.json({ error: "Invalid problem or language" }, { status: 404 });
    }

    // Determine test cases to run
    const testCasesToRun =
      customInput !== undefined && customInput !== null
        ? [{ input: customInput, expectedOutput: "" }]
        : problem.testCases.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          }));

    const results = [];
    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const res = await executeCodeOnJudge0({
        source_code: code,
        language_id: language.judge0Id,
        stdin: tc.input,
        expected_output: tc.expectedOutput || undefined,
        cpu_time_limit: problem.timeLimitMs / 1000,
        memory_limit: problem.memoryLimitMb * 1024,
      });

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: res.stdout || "",
        status: res.status.description,
        statusCode: res.status.id,
        passed: res.status.id === 3,
        executionTime: res.time ? `${parseFloat(res.time) * 1000} ms` : "—",
        memory: res.memory ? `${Math.round(res.memory / 1024)} MB` : "—",
        stderr: res.stderr,
        compileOutput: res.compile_output,
      });
    }

    const allPassed = results.every((r) => r.passed);

    return NextResponse.json({
      allPassed,
      results,
    });
  } catch (error) {
    console.error("Run code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
