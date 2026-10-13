"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  createdAt: string;
  streak: number;
  stats: {
    totalSolved: number;
    totalProblems: number;
    acceptanceRate: number;
    totalSubmissions: number;
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  recentSubmissions: Array<{
    id: string;
    status: string;
    createdAt: string;
    executionTimeMs?: number | null;
    problem: { id: string; title: string; slug: string; difficulty: string };
    language: { name: string };
  }>;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-sm text-gray-400 mb-4">The profile @{username} does not exist.</p>
          <Link
            href="/problems"
            className="px-4 py-2 bg-emerald-500 text-gray-950 font-bold rounded-lg text-xs"
          >
            Browse Problems
          </Link>
        </div>
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-[#10151d] border border-[#243042] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-2xl font-black text-white uppercase shadow-lg shadow-emerald-500/20">
            {profile.username.slice(0, 2)}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            <div className="flex items-center gap-3 pt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Streak & Overall Solved Badge */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#161e2a] border border-amber-500/20 rounded-2xl text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              <span className="text-xl font-black">{profile.streak}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Day Streak
            </span>
          </div>

          <div className="p-4 bg-[#161e2a] border border-emerald-500/20 rounded-2xl text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <Award className="w-5 h-5" />
              <span className="text-xl font-black">{stats.totalSolved}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Solved
            </span>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solved by Difficulty Bars */}
        <div className="bg-[#10151d] border border-[#243042] rounded-3xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Solved by Difficulty
          </h2>

          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider">Easy</span>
                <span className="font-mono text-gray-300">
                  {stats.easy.solved} / {stats.easy.total}
                </span>
              </div>
              <div className="w-full bg-[#161e2a] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{
                    width: `${stats.easy.total > 0 ? (stats.easy.solved / stats.easy.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider">Medium</span>
                <span className="font-mono text-gray-300">
                  {stats.medium.solved} / {stats.medium.total}
                </span>
              </div>
              <div className="w-full bg-[#161e2a] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${stats.medium.total > 0 ? (stats.medium.solved / stats.medium.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-rose-400 uppercase tracking-wider">Hard</span>
                <span className="font-mono text-gray-300">
                  {stats.hard.solved} / {stats.hard.total}
                </span>
              </div>
              <div className="w-full bg-[#161e2a] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{
                    width: `${stats.hard.total > 0 ? (stats.hard.solved / stats.hard.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#243042] grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[#161e2a] rounded-xl">
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Acceptance
              </span>
              <span className="text-lg font-black text-emerald-400">{stats.acceptanceRate}%</span>
            </div>
            <div className="p-3 bg-[#161e2a] rounded-xl">
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Total Runs
              </span>
              <span className="text-lg font-black text-white">{stats.totalSubmissions}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-[#10151d] border border-[#243042] rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Recent Activity
          </h2>

          {profile.recentSubmissions.length === 0 ? (
            <p className="text-xs text-gray-500 py-12 text-center">No recent activity recorded.</p>
          ) : (
            <div className="divide-y divide-[#243042] max-h-[380px] overflow-y-auto pr-1">
              {profile.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="py-3 flex items-center justify-between hover:bg-[#161e2a]/30 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <Link
                      href={`/problems/${sub.problem.slug}`}
                      className="font-semibold text-sm text-white hover:text-emerald-400 hover:underline"
                    >
                      {sub.problem.title}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {sub.language.name} • {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sub.status === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {sub.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
