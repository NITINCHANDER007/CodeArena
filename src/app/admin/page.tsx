"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileCode2,
  Send,
  CheckCircle,
  Plus,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";

interface AdminStats {
  stats: {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
  };
  difficultyCounts: Array<{ difficulty: string; _count: { id: number } }>;
  recentSubmissions: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: { id: string; username: string };
    problem: { id: string; title: string; slug: string };
    language: { name: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const { stats, difficultyCounts, recentSubmissions } = data || {
    stats: { totalUsers: 0, totalProblems: 0, totalSubmissions: 0, acceptedSubmissions: 0, acceptanceRate: 0 },
    difficultyCounts: [],
    recentSubmissions: [],
  };

  const getDifficultyCount = (diff: string) => {
    return difficultyCounts.find((d) => d.difficulty === diff)?._count.id || 0;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#243042]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Monitor platform metrics, user engagement, and coding challenge activity.
          </p>
        </div>
        <Link
          href="/admin/problems/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-lg shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Problem
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Problems</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalProblems}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCode2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalSubmissions}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acceptance Rate</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.acceptanceRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-[#10151d] border border-[#243042] p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Problem Catalog Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#161e2a] border border-[#243042] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-emerald-400">Easy</span>
              <p className="text-2xl font-bold text-white mt-0.5">{getDifficultyCount("EASY")}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          <div className="p-4 bg-[#161e2a] border border-[#243042] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-amber-400">Medium</span>
              <p className="text-2xl font-bold text-white mt-0.5">{getDifficultyCount("MEDIUM")}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-amber-400" />
          </div>

          <div className="p-4 bg-[#161e2a] border border-[#243042] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-rose-400">Hard</span>
              <p className="text-2xl font-bold text-white mt-0.5">{getDifficultyCount("HARD")}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-rose-400" />
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-[#10151d] border border-[#243042] p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Recent Submissions
          </h3>
          <Link
            href="/admin/submissions"
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold uppercase text-gray-400 border-b border-[#243042]">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Problem</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243042]">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#161e2a]/50">
                    <td className="py-3 text-gray-200 font-medium">{sub.user.username}</td>
                    <td className="py-3 text-emerald-400 hover:underline">
                      <Link href={`/problems/${sub.problem.slug}`}>{sub.problem.title}</Link>
                    </td>
                    <td className="py-3 text-gray-400">{sub.language.name}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          sub.status === "ACCEPTED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {new Date(sub.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
