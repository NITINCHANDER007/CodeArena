"use client";

import React, { useEffect, useState } from "react";
import {
  Tag as TagIcon,
  Globe,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: { problems: number };
}

interface LanguageItem {
  id: string;
  name: string;
  slug: string;
  judge0Id: number;
  version: string;
  isEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Tag form
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tagRes, langRes] = await Promise.all([
        fetch("/api/admin/tags"),
        fetch("/api/admin/languages"),
      ]);

      const tagData = await tagRes.json();
      const langData = await langRes.json();

      setTags(tagData.tags || []);
      setLanguages(langData.languages || []);
    } catch {
      console.error("Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError(null);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, slug: newTagSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        setTags([...tags, { ...data.tag, _count: { problems: 0 } }]);
        setNewTagName("");
        setNewTagSlug("");
      } else {
        setTagError(data.error || "Failed to create tag");
      }
    } catch {
      setTagError("Network error creating tag");
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      alert("Error deleting tag");
    }
  };

  const handleToggleLanguage = async (lang: LanguageItem) => {
    try {
      const res = await fetch("/api/admin/languages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lang.id, isEnabled: !lang.isEnabled }),
      });
      if (res.ok) {
        setLanguages((prev) =>
          prev.map((l) => (l.id === lang.id ? { ...l, isEnabled: !l.isEnabled } : l))
        );
      }
    } catch {
      alert("Error updating language");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-[#243042]">
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Configure algorithmic problem tags and supported execution languages.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tags Section */}
          <div className="space-y-4">
            <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-emerald-400" />
                Problem Tags
              </h2>

              <form onSubmit={handleCreateTag} className="space-y-3">
                {tagError && (
                  <p className="text-xs text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-800">
                    {tagError}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Tag Name (e.g. Graph)"
                    value={newTagName}
                    onChange={(e) => {
                      setNewTagName(e.target.value);
                      setNewTagSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, "-"));
                    }}
                    className="px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Slug (e.g. graph)"
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    className="px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tag
                </button>
              </form>

              <div className="space-y-2 max-h-96 overflow-y-auto pt-2 border-t border-[#243042]">
                {tags.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 bg-[#161e2a] rounded-lg border border-[#243042]"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white">{t.name}</span>
                      <span className="text-[10px] text-gray-400 ml-2 font-mono">/{t.slug}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">{t._count.problems} problems</span>
                      <button
                        onClick={() => handleDeleteTag(t.id, t.name)}
                        className="text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="space-y-4">
            <div className="bg-[#10151d] border border-[#243042] p-5 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Supported Execution Languages
              </h2>
              <p className="text-xs text-gray-400">
                All languages run isolated in Judge0 sandbox. Python is permanently disabled per system policy.
              </p>

              <div className="space-y-3 pt-2">
                {languages.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 bg-[#161e2a] rounded-xl border border-[#243042] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{l.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] text-gray-400 border border-[#243042]">
                          Judge0 ID: {l.judge0Id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{l.version}</p>
                    </div>

                    <button
                      onClick={() => handleToggleLanguage(l)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                        l.isEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/40 hover:bg-gray-500/30"
                      }`}
                    >
                      {l.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
