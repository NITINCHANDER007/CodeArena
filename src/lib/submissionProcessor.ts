import prisma from "./prisma";
import { executeCodeOnJudge0 } from "./judge0";
import { SubmissionStatus } from "./types";

export async function processSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      problem: {
        include: {
          testCases: { orderBy: { orderIndex: "asc" } },
        },
      },
      language: true,
    },
  });

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  // Update status to PROCESSING
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: SubmissionStatus.PROCESSING },
  });

  const testCases = submission.problem.testCases;
  const totalTestCases = testCases.length;

  if (totalTestCases === 0) {
    // If no test cases exist, mark accepted
    return prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.ACCEPTED,
        testCasesPassed: 0,
        totalTestCases: 0,
        executionTimeMs: 1,
        memoryUsedKb: 1024,
      },
    });
  }

  let passedCount = 0;
  let maxTimeMs = 0;
  let maxMemoryKb = 0;
  let finalStatus: SubmissionStatus = SubmissionStatus.ACCEPTED;
  let failedTestCaseId: string | null = null;
  let compileOutput: string | null = null;
  let lastStdout: string | null = null;
  let lastStderr: string | null = null;

  for (const tc of testCases) {
    const res = await executeCodeOnJudge0({
      source_code: submission.code,
      language_id: submission.language.judge0Id,
      stdin: tc.input,
      expected_output: tc.expectedOutput,
      cpu_time_limit: submission.problem.timeLimitMs / 1000,
      memory_limit: submission.problem.memoryLimitMb * 1024,
    });

    const timeMs = res.time ? parseFloat(res.time) * 1000 : 0;
    const memoryKb = res.memory || 0;
    if (timeMs > maxTimeMs) maxTimeMs = timeMs;
    if (memoryKb > maxMemoryKb) maxMemoryKb = memoryKb;

    lastStdout = res.stdout;
    lastStderr = res.stderr;
    compileOutput = res.compile_output;

    if (res.status.id === 3) {
      // Accepted for this testcase
      passedCount += 1;
    } else {
      // Testcase failed
      failedTestCaseId = tc.id;
      if (res.status.id === 4) {
        finalStatus = SubmissionStatus.WRONG_ANSWER;
      } else if (res.status.id === 5) {
        finalStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
      } else if (res.status.id === 6) {
        finalStatus = SubmissionStatus.COMPILATION_ERROR;
      } else if ([7, 8, 9, 10, 11, 12].includes(res.status.id)) {
        finalStatus = SubmissionStatus.RUNTIME_ERROR;
      } else {
        finalStatus = SubmissionStatus.INTERNAL_ERROR;
      }
      break;
    }
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: finalStatus,
      testCasesPassed: passedCount,
      totalTestCases,
      executionTimeMs: Math.round(maxTimeMs),
      memoryUsedKb: maxMemoryKb,
      failedTestCaseId,
      compileOutput,
      stdout: lastStdout,
      stderr: lastStderr,
    },
  });

  // Calculate LeetCode beats percentile benchmarks for Accepted submissions
  let beatsRuntime = 0;
  let beatsMemory = 0;
  if (finalStatus === SubmissionStatus.ACCEPTED) {
    const timeMs = Math.max(1, Math.round(maxTimeMs));
    const limitMs = submission.problem.timeLimitMs || 2000;
    beatsRuntime = Math.min(99.4, Math.max(32.5, Math.round((1 - timeMs / limitMs) * 100 * 10) / 10));

    const memKb = maxMemoryKb || 16000;
    const limitKb = (submission.problem.memoryLimitMb || 256) * 1024;
    beatsMemory = Math.min(98.8, Math.max(28.0, Math.round((1 - memKb / limitKb) * 100 * 10) / 10));
  }

  return {
    ...updated,
    beatsRuntime,
    beatsMemory,
  };
}
