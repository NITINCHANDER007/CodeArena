"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Sparkles,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  rank: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setLeaderboard(d.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-sm text-gray-400">
          Top algorithm engineers ranked by solved challenge volume and submission precision.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No leaderboard data available yet.</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end pt-4">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-[#10151d] border border-slate-700/60 p-6 rounded-2xl text-center space-y-3 relative shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-slate-400/20 border border-slate-400/40 text-slate-300 flex items-center justify-center mx-auto font-bold text-sm">
                    #2
                  </div>
                  <div>
                    <Link
                      href={`/profile/${topThree[1].username}`}
                      className="font-bold text-lg text-white hover:text-emerald-400 transition-colors"
                    >
                      {topThree[1].name}
                    </Link>
                    <p className="text-xs text-gray-400">@{topThree[1].username}</p>
                  </div>
                  <div className="p-3 bg-[#161e2a] rounded-xl border border-[#243042] flex justify-around text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Solved</span>
                      <span className="font-extrabold text-white text-base">
                        {topThree[1].totalSolved}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Accuracy</span>
                      <span className="font-extrabold text-emerald-400 text-base">
                        {topThree[1].acceptanceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place (Center & Elevated) */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-[#10151d] border-2 border-amber-500/50 p-7 rounded-2xl text-center space-y-3 relative shadow-2xl shadow-amber-500/10 md:-translate-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-400 flex items-center justify-center mx-auto font-extrabold text-lg shadow-lg">
                    👑 #1
                  </div>
                  <div>
                    <Link
                      href={`/profile/${topThree[0].username}`}
                      className="font-extrabold text-xl text-white hover:text-emerald-400 transition-colors"
                    >
                      {topThree[0].name}
                    </Link>
                    <p className="text-xs text-gray-400">@{topThree[0].username}</p>
                  </div>
                  <div className="p-3.5 bg-[#161e2a] rounded-xl border border-amber-500/30 flex justify-around text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Solved</span>
                      <span className="font-extrabold text-white text-lg">
                        {topThree[0].totalSolved}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Accuracy</span>
                      <span className="font-extrabold text-emerald-400 text-lg">
                        {topThree[0].acceptanceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 bg-[#10151d] border border-amber-900/40 p-6 rounded-2xl text-center space-y-3 relative shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-amber-800/20 border border-amber-700/40 text-amber-600 flex items-center justify-center mx-auto font-bold text-sm">
                    #3
                  </div>
                  <div>
                    <Link
                      href={`/profile/${topThree[2].username}`}
                      className="font-bold text-lg text-white hover:text-emerald-400 transition-colors"
                    >
                      {topThree[2].name}
                    </Link>
                    <p className="text-xs text-gray-400">@{topThree[2].username}</p>
                  </div>
                  <div className="p-3 bg-[#161e2a] rounded-xl border border-[#243042] flex justify-around text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Solved</span>
                      <span className="font-extrabold text-white text-base">
                        {topThree[2].totalSolved}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Accuracy</span>
                      <span className="font-extrabold text-emerald-400 text-base">
                        {topThree[2].acceptanceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#161e2a] text-xs uppercase font-semibold text-gray-400 border-b border-[#243042]">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Total Solved</th>
                    <th className="py-3.5 px-4">Easy</th>
                    <th className="py-3.5 px-4">Medium</th>
                    <th className="py-3.5 px-4">Hard</th>
                    <th className="py-3.5 px-4 text-right">Acceptance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243042]">
                  {leaderboard.map((u) => (
                    <tr key={u.id} className="hover:bg-[#161e2a]/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold">
                        {u.rank === 1 ? (
                          <span className="text-amber-400 font-extrabold">1 🥇</span>
                        ) : u.rank === 2 ? (
                          <span className="text-slate-300 font-extrabold">2 🥈</span>
                        ) : u.rank === 3 ? (
                          <span className="text-amber-600 font-extrabold">3 🥉</span>
                        ) : (
                          <span className="text-gray-500 font-mono text-xs">{u.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/profile/${u.username}`}
                          className="font-semibold text-white hover:text-emerald-400 transition-colors"
                        >
                          {u.name}
                        </Link>
                        <span className="block text-xs text-gray-500">@{u.username}</span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-white text-base">
                        {u.totalSolved}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-mono text-xs">
                        {u.easySolved}
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-mono text-xs">
                        {u.mediumSolved}
                      </td>
                      <td className="py-3.5 px-4 text-rose-400 font-mono text-xs">
                        {u.hardSolved}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-gray-300">
                        {u.acceptanceRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
