import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/tokens";
import { getSubmissionQueue } from "@/lib/queue";
import { processSubmission } from "@/lib/submissionProcessor";
import { SubmissionStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;
    const payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      return NextResponse.json({ error: "Please log in to submit your solution." }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, languageId, code } = body;

    if (!problemId || !languageId || !code) {
      return NextResponse.json({ error: "Missing required submission fields" }, { status: 400 });
    }

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId, isPublished: true },
      include: { testCases: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Create Submission record in DB
    const submission = await prisma.submission.create({
      data: {
        userId: payload.userId,
        problemId,
        languageId,
        code,
        status: SubmissionStatus.PENDING,
        totalTestCases: problem.testCases.length,
      },
    });

    // Enqueue in BullMQ if queue is available, or process directly
    const queue = getSubmissionQueue();
    if (queue) {
      try {
        await queue.add("evaluate", { submissionId: submission.id });
      } catch (queueErr) {
        // Fallback to direct background execution
        processSubmission(submission.id).catch((e) =>
          console.error("Direct processor error:", e)
        );
      }
    } else {
      // Execute directly
      processSubmission(submission.id).catch((e) =>
        console.error("Direct processor error:", e)
      );
    }

    // Immediately evaluate or return id for polling
    // For swift UI responsiveness, if worker is not separated, wait up to 3.5s for result
    const evaluated = await Promise.race([
      processSubmission(submission.id),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500)),
    ]);

    if (evaluated) {
      return NextResponse.json({ submission: evaluated }, { status: 201 });
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Submit code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
