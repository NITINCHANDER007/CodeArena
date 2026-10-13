"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ListOrdered,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isPublished: boolean;
  orderIndex: number;
  tags: Array<{ tag: { id: string; name: string } }>;
  _count: {
    testCases: number;
    submissions: number;
  };
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/problems?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setProblems(data.problems || []);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search]);

  const togglePublish = async (problem: ProblemItem) => {
    try {
      const res = await fetch(`/api/admin/problems/${problem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !problem.isPublished }),
      });
      if (res.ok) {
        setProblems((prev) =>
          prev.map((p) => (p.id === problem.id ? { ...p, isPublished: !p.isPublished } : p))
        );
      }
    } catch {
      alert("Failed to toggle publish status");
    }
  };

  const deleteProblem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete problem "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/problems/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete problem");
      }
    } catch {
      alert("Network error while deleting");
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/30";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243042]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Problems Management</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Create, update, manage test cases, and publish coding problems.
          </p>
        </div>
        <Link
          href="/admin/problems/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-lg shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Problem
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-[#10151d] border border-[#243042] rounded-xl px-4 py-2.5">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none w-full"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Problems Table */}
      <div className="bg-[#10151d] border border-[#243042] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>No problems found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161e2a] text-xs uppercase font-semibold text-gray-400 border-b border-[#243042]">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4">Test Cases</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243042]">
                {problems.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-[#161e2a]/40 transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">{p.orderIndex || idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link href={`/problems/${p.slug}`} className="hover:text-emerald-400 hover:underline">
                        {p.title}
                      </Link>
                      <span className="block text-xs font-normal text-gray-500">/{p.slug}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getDifficultyBadge(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.tags.map((t) => (
                          <span key={t.tag.id} className="text-[11px] px-2 py-0.5 rounded bg-[#161f2e] text-gray-300 border border-[#243042]">
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/problems/${p.id}/testcases`}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        {p._count.testCases} Cases
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs">
                      {p._count.submissions}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => togglePublish(p)}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          p.isPublished
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                        }`}
                      >
                        {p.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/problems/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#161f2e] transition-colors"
                          title="Edit Problem"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProblem(p.id, p.title)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
