"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Cpu,
  Loader2,
  X,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  status: string;
  code: string;
  executionTimeMs?: number | null;
  memoryUsedKb?: number | null;
  testCasesPassed: number;
  totalTestCases: number;
  compileOutput?: string | null;
  stdout?: string | null;
  stderr?: string | null;
  createdAt: string;
  user: { id: string; username: string; email: string };
  problem: { id: string; title: string; slug: string; difficulty: string };
  language: { name: string };
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [inspectSubmission, setInspectSubmission] = useState<SubmissionItem | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/api/admin/submissions?status=${statusFilter}`
        : `/api/admin/submissions`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch {
      console.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "WRONG_ANSWER":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      case "TIME_LIMIT_EXCEEDED":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "COMPILATION_ERROR":
      case "RUNTIME_ERROR":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "PENDING":
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243042]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submissions Audit</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Inspect all platform code submissions, verdict analytics, runtimes, and memory usage.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#10151d] border border-[#243042] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WRONG_ANSWER">Wrong Answer</option>
            <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
            <option value="RUNTIME_ERROR">Runtime Error</option>
            <option value="COMPILATION_ERROR">Compilation Error</option>
          </select>
        </div>
      </div>

      <div className="bg-[#10151d] border border-[#243042] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No submissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161e2a] text-xs uppercase font-semibold text-gray-400 border-b border-[#243042]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Problem</th>
                  <th className="py-3.5 px-4">Verdict</th>
                  <th className="py-3.5 px-4">Passed</th>
                  <th className="py-3.5 px-4">Runtime</th>
                  <th className="py-3.5 px-4">Memory</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243042]">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#161e2a]/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      @{s.user.username}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">
                      <Link href={`/problems/${s.problem.slug}`} className="hover:underline">
                        {s.problem.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadge(s.status)}`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-300">
                      {s.testCasesPassed} / {s.totalTestCases}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-300">
                      {s.executionTimeMs !== null && s.executionTimeMs !== undefined
                        ? `${s.executionTimeMs} ms`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-300">
                      {s.memoryUsedKb !== null && s.memoryUsedKb !== undefined
                        ? `${Math.round(s.memoryUsedKb / 1024)} MB`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {s.language.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectSubmission(s)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#161e2a] hover:bg-[#1f2d42] text-gray-200 rounded-lg border border-[#243042] transition-colors"
                      >
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Inspection Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#243042] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">
                  Submission Code: {inspectSubmission.problem.title}
                </h3>
                <p className="text-xs text-gray-400">
                  By @{inspectSubmission.user.username} ({inspectSubmission.language.name})
                </p>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="p-4 bg-[#0d1117] border border-[#243042] rounded-xl text-emerald-300 overflow-x-auto whitespace-pre">
                {inspectSubmission.code}
              </div>

              {inspectSubmission.compileOutput && (
                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-purple-300">
                  <span className="font-bold block mb-1">Compiler Output:</span>
                  <pre className="whitespace-pre-wrap">{inspectSubmission.compileOutput}</pre>
                </div>
              )}

              {inspectSubmission.stderr && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300">
                  <span className="font-bold block mb-1">Standard Error:</span>
                  <pre className="whitespace-pre-wrap">{inspectSubmission.stderr}</pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#243042] shrink-0">
              <button
                onClick={() => setInspectSubmission(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#161e2a] hover:bg-[#1f2d42] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
