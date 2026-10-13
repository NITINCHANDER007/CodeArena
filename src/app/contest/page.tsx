"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Award,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
} from "lucide-react";

const UPCOMING_CONTESTS = [
  {
    id: "weekly-440",
    title: "Weekly Contest 440",
    type: "Weekly",
    startTime: "Sunday, 08:00 AM UTC",
    duration: "1h 30m",
    problemsCount: 4,
    registeredCount: 14210,
    isRegistered: false,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
  },
  {
    id: "biweekly-148",
    title: "Biweekly Contest 148",
    type: "Biweekly",
    startTime: "Saturday, 02:30 PM UTC",
    duration: "1h 30m",
    problemsCount: 4,
    registeredCount: 9850,
    isRegistered: true,
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
  },
];

const PAST_CONTESTS = [
  {
    id: "weekly-439",
    title: "Weekly Contest 439",
    date: "Oct 08, 2026",
    participants: 23150,
    winner: "tourist (Rating 3782)",
    problems: ["Sum of Good Subsequences", "Lexicographically Smallest String", "Shortest Distance After Road Additions", "Maximum Points After Operations"],
  },
  {
    id: "biweekly-147",
    title: "Biweekly Contest 147",
    date: "Sep 28, 2026",
    participants: 19420,
    winner: "neal_wu (Rating 3490)",
    problems: ["Design Neighbor Sum Service", "Minimum Substring Partition", "Construct 2D Array", "Shortest Path in Weighted Graph"],
  },
  {
    id: "weekly-438",
    title: "Weekly Contest 438",
    date: "Sep 21, 2026",
    participants: 24900,
    winner: "ecnerwala (Rating 3612)",
    problems: ["Check Balanced String", "Maximum Frequency After K Operations", "Count Substrings That Satisfy K Constraint", "Maximize Sum of Array"],
  },
];

const TOP_RATED = [
  { rank: 1, username: "tourist", rating: 3782, badge: "Grandmaster", country: "PL" },
  { rank: 2, username: "ecnerwala", rating: 3612, badge: "Grandmaster", country: "US" },
  { rank: 3, username: "neal_wu", rating: 3490, badge: "Master", country: "US" },
  { rank: 4, username: "Benq", rating: 3380, badge: "Master", country: "US" },
  { rank: 5, username: "johncoder", rating: 2150, badge: "Knight", country: "IN" },
];

export default function ContestPage() {
  const [registered, setRegistered] = useState<Record<string, boolean>>({
    "biweekly-148": true,
  });

  const toggleRegister = (id: string) => {
    setRegistered((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#243042]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            CodeArena Contests
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Compete in weekly rated algorithmic rounds, climb the global ranking ladder, and earn contest badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#161e2a] border border-[#243042] text-xs">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-gray-300">Your Contest Rating:</span>
            <span className="font-mono font-bold text-emerald-400">2,150 (Knight)</span>
          </div>
        </div>
      </div>

      {/* Featured Upcoming Contests */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          Upcoming Rounds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {UPCOMING_CONTESTS.map((contest) => {
            const isReg = registered[contest.id];
            return (
              <div
                key={contest.id}
                className="relative overflow-hidden rounded-2xl bg-[#10151d] border border-[#243042] p-6 shadow-xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {contest.type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      {(contest.registeredCount + (isReg ? 1 : 0)).toLocaleString()} Registered
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                    {contest.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-300">
                    <div className="bg-[#161e2a] p-2.5 rounded-xl border border-[#243042]">
                      <span className="text-gray-500 block text-[11px]">Date & Time</span>
                      <span className="font-medium text-white">{contest.startTime}</span>
                    </div>
                    <div className="bg-[#161e2a] p-2.5 rounded-xl border border-[#243042]">
                      <span className="text-gray-500 block text-[11px]">Format</span>
                      <span className="font-medium text-white">4 Problems • 90 Mins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#243042] flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Rated for all users
                  </span>

                  <button
                    onClick={() => toggleRegister(contest.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isReg
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-extrabold hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20"
                    }`}
                  >
                    {isReg ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Registered
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Past Contests + Top Rated Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Past Contests List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Past Contests & Virtual Participation
          </h2>

          <div className="bg-[#10151d] border border-[#243042] rounded-2xl divide-y divide-[#243042] overflow-hidden">
            {PAST_CONTESTS.map((c) => (
              <div key={c.id} className="p-5 hover:bg-[#161e2a]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{c.title}</span>
                    <span className="text-xs text-gray-500 font-mono">{c.date}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Winner: <span className="text-amber-400 font-semibold">{c.winner}</span> • {c.participants.toLocaleString()} participants
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.problems.slice(0, 3).map((pName) => (
                      <span key={pName} className="text-[10px] px-2 py-0.5 rounded bg-[#16202e] text-gray-400 border border-[#243042]">
                        {pName}
                      </span>
                    ))}
                    <span className="text-[10px] text-gray-500 pt-0.5">+1 more</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/problems`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161e2a] hover:bg-[#1f2937] text-white border border-[#243042] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    Virtual Contest
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Contest Top Rated Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Top Global Contestants
          </h2>

          <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="space-y-3">
              {TOP_RATED.map((contestant) => (
                <div
                  key={contestant.username}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#161e2a] border border-[#243042] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-bold ${contestant.rank === 1 ? "text-amber-400" : contestant.rank === 2 ? "text-gray-300" : contestant.rank === 3 ? "text-orange-400" : "text-gray-500"}`}>
                      #{contestant.rank}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{contestant.username}</span>
                      <span className="text-[10px] text-gray-400">{contestant.badge}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 block">{contestant.rating}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{contestant.country}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/leaderboard"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-gray-300 bg-[#16202e] hover:bg-[#1a2536] border border-[#243042] transition-colors"
            >
              View Full Leaderboard
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
