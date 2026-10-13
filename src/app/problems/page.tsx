"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Circle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code2,
  Sparkles,
  Shuffle,
  Flame,
  Calendar,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Building2,
  Clock,
  Compass,
} from "lucide-react";

interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  orderIndex: number;
  tags: Array<{ id: string; name: string; slug: string }>;
  companies?: string[];
  totalSubmissions: number;
  acceptanceRate: number;
  isSolved: boolean;
  isBookmarked?: boolean;
}

const STUDY_PLANS = [
  {
    id: "top-150",
    name: "Top Interview 150",
    description: "Must-do interview prep curated by FAANG engineers",
    progress: "4 / 150",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    tagSlug: "array",
  },
  {
    id: "blind-75",
    name: "Blind 75 Essential",
    description: "The classic 75 problems to master core algorithms",
    progress: "5 / 75",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
    tagSlug: "hash-table",
  },
  {
    id: "leetcode-75",
    name: "LeetCode 75",
    description: "Ace coding interviews with systematic pattern practice",
    progress: "2 / 75",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
    tagSlug: "stack",
  },
  {
    id: "dp-mastery",
    name: "Dynamic Programming",
    description: "Conquer 0/1 Knapsack, memoization & bottom-up DP",
    progress: "1 / 40",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
    tagSlug: "two-pointers",
  },
];

const COMPANIES = [
  { name: "Google", color: "hover:border-blue-400" },
  { name: "Meta", color: "hover:border-blue-500" },
  { name: "Amazon", color: "hover:border-amber-400" },
  { name: "Microsoft", color: "hover:border-teal-400" },
  { name: "Apple", color: "hover:border-gray-300" },
  { name: "Uber", color: "hover:border-rose-400" },
];

export default function ProblemsListPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingRandom, setPickingRandom] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState(""); // "", "solved", "unsolved", "bookmarked"
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Tags
  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) => setAllTags(d.tags || []));
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (difficulty) params.set("difficulty", difficulty);
      if (status) params.set("status", status);
      if (selectedTag) params.set("tag", selectedTag);
      if (selectedCompany) params.set("company", selectedCompany);
      params.set("page", String(page));
      params.set("limit", "15");

      const res = await fetch(`/api/problems?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProblems(data.problems || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search, difficulty, status, selectedTag, selectedCompany, page]);

  // "Pick One" random problem handler
  const handlePickRandom = async () => {
    try {
      setPickingRandom(true);
      const res = await fetch("/api/problems/random");
      const data = await res.json();
      if (data.slug) {
        router.push(`/problems/${data.slug}`);
      } else if (problems.length > 0) {
        const randomProblem = problems[Math.floor(Math.random() * problems.length)];
        router.push(`/problems/${randomProblem.slug}`);
      }
    } catch {
      if (problems.length > 0) {
        router.push(`/problems/${problems[0].slug}`);
      }
    } finally {
      setPickingRandom(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "HARD":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-600";
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Daily Coding Challenge & Pick One Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Challenge Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b26] via-[#162338] to-[#121824] border border-emerald-500/30 p-6 shadow-2xl flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Calendar className="w-3.5 h-3.5" />
                  Daily Challenge
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  +10 LeetCoins
                </span>
                <span className="text-xs text-gray-400 font-mono">October 14</span>
              </div>
              <h2 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                1. Two Sum
              </h2>
              <p className="text-sm text-gray-400 mt-1 max-w-lg">
                Given an array of integers <code className="text-emerald-400 font-mono">nums</code> and an integer <code className="text-emerald-400 font-mono">target</code>, return indices of the two numbers.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <Link
                href="/problems/two-sum"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Solve Challenge
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                Resets in 01h 32m
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-[#243042]/70 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Flame className="w-4 h-4 text-orange-400" />
                Streak: 5 Days
              </span>
              <span>•</span>
              <span className="text-gray-300">142,890 Solvers Today</span>
            </div>
            <span className="text-emerald-400 font-medium">Acceptance: 52.4%</span>
          </div>
        </div>

        {/* Quick Actions & Pick One (Shuffle) */}
        <div className="rounded-2xl bg-[#10151d] border border-[#243042] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Quick Launcher
              </span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                {totalCount} Problems
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Feeling Lucky?</h3>
            <p className="text-xs text-gray-400 mt-1">
              Pick a random problem at your level to practice under interview time limits.
            </p>
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              onClick={handlePickRandom}
              disabled={pickingRandom}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm bg-[#162338] hover:bg-[#1c2c47] text-white border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-md group disabled:opacity-50"
            >
              {pickingRandom ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Shuffle className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
              )}
              <span>Pick One (Random Problem)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setStatus("unsolved");
                  setPage(1);
                }}
                className="py-2 px-3 rounded-lg bg-[#161e2a] hover:bg-[#1f2937] text-gray-300 border border-[#243042] text-center font-medium"
              >
                Unsolved Only
              </button>
              <button
                onClick={() => {
                  setStatus("bookmarked");
                  setPage(1);
                }}
                className="py-2 px-3 rounded-lg bg-[#161e2a] hover:bg-[#1f2937] text-amber-300 border border-amber-500/20 text-center font-medium flex items-center justify-center gap-1"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Favorites
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Curated Study Plans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Curated Study Plans</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Interactive
            </span>
          </div>
          <span className="text-xs text-gray-400">Click a plan to filter problems</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STUDY_PLANS.map((plan) => {
            const isSelected = selectedTag === plan.tagSlug;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedTag(isSelected ? "" : plan.tagSlug);
                  setPage(1);
                }}
                className={`cursor-pointer rounded-xl p-4 border bg-gradient-to-b ${plan.color} transition-all hover:scale-[1.02] ${
                  isSelected ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/10" : ""
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="truncate">{plan.name}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{plan.progress}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {plan.description}
                </p>
                <div className="w-full bg-[#161e2a] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${(parseInt(plan.progress) / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search problems by name or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3.5 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Difficulty: All</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Status: All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="bookmarked">⭐ Starred / Bookmarks</option>
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Topic: All Topics</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Company Pills & Popular Topics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#243042]/50 text-xs">
          {/* Company Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-gray-400 flex items-center gap-1 mr-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              Company:
            </span>
            {COMPANIES.map((c) => {
              const isSelected = selectedCompany === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCompany(isSelected ? "" : c.name);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-gray-950 font-bold border-emerald-400 shadow-sm"
                      : `bg-[#161e2a] text-gray-300 border-[#243042] ${c.color}`
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Quick Clear Filter if active */}
          {(search || difficulty || status || selectedTag || selectedCompany) && (
            <button
              onClick={() => {
                setSearch("");
                setDifficulty("");
                setStatus("");
                setSelectedTag("");
                setSelectedCompany("");
                setPage(1);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 self-end sm:self-auto"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Problems Table */}
      <div className="bg-[#10151d] border border-[#243042] rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <div className="py-20 text-center text-gray-400 space-y-2">
            <Code2 className="w-10 h-10 mx-auto text-gray-500" />
            <p className="font-semibold text-white">No problems found</p>
            <p className="text-xs">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#161e2a] text-xs uppercase font-semibold text-gray-400 border-b border-[#243042]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Companies</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-right">Acceptance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243042]">
                {problems.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#161e2a]/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center">
                      {p.isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-600 mx-auto group-hover:text-gray-400" />
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${p.slug}`}
                          className="font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2"
                        >
                          <span className="text-xs text-gray-500 font-mono">
                            {p.orderIndex || idx + 1}.
                          </span>
                          {p.title}
                        </Link>
                        {p.isBookmarked && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getDifficultyBadge(
                          p.difficulty
                        )}`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.companies && p.companies.length > 0 ? (
                          p.companies.slice(0, 3).map((comp) => (
                            <span
                              key={comp}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40"
                            >
                              {comp}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t.id}
                            className="text-[11px] px-2 py-0.5 rounded bg-[#161f2e] text-gray-300 border border-[#243042]"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-gray-300">
                      {p.acceptanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#243042] bg-[#0d1117] text-xs text-gray-400">
            <span>
              Page {page} of {totalPages} ({totalCount} total problems)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-[#243042] hover:bg-[#161f2e] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-[#243042] hover:bg-[#161f2e] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
