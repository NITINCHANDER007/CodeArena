"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Difficulty } from "@/lib/types";
import { ArrowLeft, Save, Code, Tag as TagIcon, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface Tag {
  id: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
  slug: string;
}

interface ProblemFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: Difficulty;
    isPublished: boolean;
    timeLimitMs: number;
    memoryLimitMb: number;
    orderIndex: number;
    tags: Array<{ tagId?: string; tag?: { id: string } }>;
    starterCodes: Array<{ languageId: string; code: string }>;
  };
  isEdit?: boolean;
}

export default function ProblemForm({ initialData, isEdit = false }: ProblemFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description ||
      `Given an integer array \`nums\`, return ...\n\n### Example 1:\n\`\`\`text\nInput: nums = [1,2,3]\nOutput: [3,2,1]\n\`\`\`\n\n### Constraints:\n- \`1 <= nums.length <= 10^5\``
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || "EASY");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [timeLimitMs, setTimeLimitMs] = useState(initialData?.timeLimitMs || 2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(initialData?.memoryLimitMb || 256);
  const [orderIndex, setOrderIndex] = useState(initialData?.orderIndex || 0);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t) => t.tagId || t.tag?.id || "") || []
  );

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangTab, setSelectedLangTab] = useState<string>("");
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags and languages
  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) => setAvailableTags(d.tags || []));

    fetch("/api/admin/languages")
      .then((r) => r.json())
      .then((d) => {
        const langs: Language[] = d.languages || [];
        setLanguages(langs);
        if (langs.length > 0 && !selectedLangTab) {
          setSelectedLangTab(langs[0].id);
        }

        // Initialize starter codes
        const codeMap: Record<string, string> = {};
        langs.forEach((l) => {
          const existingCode = initialData?.starterCodes?.find((sc) => sc.languageId === l.id);
          codeMap[l.id] =
            existingCode?.code ||
            (l.slug === "javascript"
              ? `function solution(input) {\n  // Write your code here\n}\n`
              : l.slug === "cpp"
              ? `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write code\n  return 0;\n}\n`
              : `import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Write code\n  }\n}\n`);
        });
        setStarterCodes(codeMap);
      });
  }, [initialData]);

  // Auto slug generation
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        description,
        difficulty,
        isPublished,
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb),
        orderIndex: Number(orderIndex),
        tagIds: selectedTagIds,
        starterCodes: Object.entries(starterCodes).map(([languageId, code]) => ({
          languageId,
          code,
        })),
      };

      const url = isEdit ? `/api/admin/problems/${initialData?.id}` : "/api/admin/problems";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save problem");
      } else {
        const problemId = data.problem?.id || initialData?.id;
        router.push(`/admin/problems/${problemId}/testcases`);
        router.refresh();
      }
    } catch {
      setError("Network error while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#243042]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#161f2e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isEdit ? "Edit Problem" : "Create New Problem"}
            </h1>
            <p className="text-xs text-gray-400">
              Provide problem statement, tags, limits, and starter code per language.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-bold text-sm rounded-lg shadow-md transition-colors cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEdit ? "Update Problem" : "Create & Add Test Cases"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Fields & Markdown (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-300 tracking-wider mb-1.5">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Reverse Linked List"
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-300 tracking-wider mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="reverse-linked-list"
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-gray-300 tracking-wider">
                  Description, Examples & Constraints (Markdown) *
                </label>
                <span className="text-[11px] text-gray-500">Supports GFM Markdown</span>
              </div>
              <textarea
                required
                rows={14}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="Write the full problem description in Markdown..."
              />
            </div>
          </div>

          {/* Starter Codes Section */}
          <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#243042] pb-3">
              <span className="text-xs font-semibold uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                Starter Code Templates
              </span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLangTab(lang.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedLangTab === lang.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-gray-400 hover:text-white hover:bg-[#161e2a]"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedLangTab && (
              <textarea
                rows={10}
                value={starterCodes[selectedLangTab] || ""}
                onChange={(e) =>
                  setStarterCodes({
                    ...starterCodes,
                    [selectedLangTab]: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#243042] rounded-lg text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Right Column: Settings & Metadata (1 col) */}
        <div className="space-y-5">
          <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase text-gray-300 tracking-wider pb-2 border-b border-[#243042]">
              Problem Configuration
            </h3>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Time Limit (ms)
                </label>
                <input
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={timeLimitMs}
                  onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Memory Limit (MB)
                </label>
                <input
                  type="number"
                  min={16}
                  max={1024}
                  value={memoryLimitMb}
                  onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Order index */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Problem Display Order #
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-white block">Publish Status</span>
                <span className="text-[11px] text-gray-400">Make visible to normal users</span>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 rounded bg-[#161e2a] border-[#243042] text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tags Picker */}
          <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold uppercase text-gray-300 tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#243042]">
              <TagIcon className="w-4 h-4 text-emerald-400" />
              Categorization Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      selected
                        ? "bg-emerald-500 text-gray-950 font-bold border-emerald-400"
                        : "bg-[#161e2a] text-gray-300 border-[#243042] hover:border-gray-500"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
