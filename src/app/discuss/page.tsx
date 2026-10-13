"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  PlusCircle,
  Briefcase,
  DollarSign,
  HelpCircle,
  Sparkles,
  User,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  upvotes: number;
  commentsCount: number;
  tags: string[];
  snippet: string;
}

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    title: "Google L4 Software Engineer Interview Experience (Bangalore/Hyderabad) - Offer Accepted!",
    category: "Interview Experience",
    author: "coder_sam",
    date: "2 hours ago",
    upvotes: 184,
    commentsCount: 42,
    tags: ["Google", "L4", "Offer", "Graph", "DP"],
    snippet: "Had 3 DSA rounds and 1 Googlyness round. Round 1 was an interesting variation of Trapping Rain Water in 3D. Round 2 focused on topological sorting and cycle detection...",
  },
  {
    id: "2",
    title: "Meta E5 Compensation Breakdown & Negotiation Strategy (2026)",
    category: "Compensation",
    author: "swe_ninja",
    date: "5 hours ago",
    upvotes: 295,
    commentsCount: 68,
    tags: ["Meta", "E5", "Salary", "Negotiation"],
    snippet: "Base: $210,000 | Stock: $400,000 / 4 yrs | Bonus: 15% | Sign-on: $50,000. Here are the counter-offer levers I used during the negotiation call...",
  },
  {
    id: "3",
    title: "Top 20 Dynamic Programming Patterns You MUST Know Before FAANG Interviews",
    category: "Interview Questions",
    author: "algo_expert",
    date: "1 day ago",
    upvotes: 612,
    commentsCount: 94,
    tags: ["Dynamic Programming", "Tutorial", "Guide"],
    snippet: "Dynamic Programming often scares candidates. In this detailed breakdown, I categorize all 150 LeetCode DP problems into 6 canonical patterns: 0/1 Knapsack, Unbounded Knapsack, Fibonacci, LCS, LIS, and Matrix Chain...",
  },
  {
    id: "4",
    title: "Amazon SDE 2 System Design: Design a Rate Limiter with Redis & Sliding Window",
    category: "Interview Questions",
    author: "cloud_arch",
    date: "2 days ago",
    upvotes: 142,
    commentsCount: 29,
    tags: ["System Design", "Amazon", "Redis"],
    snippet: "Comprehensive architecture deep-dive: Token Bucket vs Leaky Bucket vs Sliding Window Counter. Why Redis Sorted Sets are ideal for distributed sliding log rate limiters...",
  },
  {
    id: "5",
    title: "How I went from 0 DSA knowledge to Google in 6 months using CodeArena",
    category: "Career",
    author: "rookie_to_pro",
    date: "3 days ago",
    upvotes: 430,
    commentsCount: 77,
    tags: ["Success Story", "Study Plan", "Motivation"],
    snippet: "Consistent 2 problems a day, focusing on understanding time/space complexities rather than memorizing code. Never look at solutions before spending 30 focused minutes...",
  },
];

const CATEGORIES = [
  { name: "All", icon: Sparkles },
  { name: "Interview Experience", icon: Briefcase },
  { name: "Interview Questions", icon: HelpCircle },
  { name: "Compensation", icon: DollarSign },
  { name: "Career", icon: TrendingUp },
];

export default function DiscussPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Interview Experience");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  const handleUpvote = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Post = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      author: "you",
      date: "Just now",
      upvotes: 1,
      commentsCount: 0,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      snippet: newContent.slice(0, 180) + "...",
    };

    setPosts([created, ...posts]);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setShowModal(false);
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.snippet.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#243042]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            CodeArena Discuss
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Exchange interview experiences, discuss algorithmic solutions, negotiate compensation, and grow together.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Discussion
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20"
                      : "bg-[#161e2a] text-gray-300 border border-[#243042] hover:border-gray-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search discussions or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#161e2a] border border-[#243042] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Posts List & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center bg-[#10151d] border border-[#243042] rounded-2xl text-gray-400 space-y-2">
              <MessageCircle className="w-10 h-10 mx-auto text-gray-600" />
              <p className="font-semibold text-white">No discussions found</p>
              <p className="text-xs">Be the first to share your experience or question!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#10151d] border border-[#243042] hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <User className="w-3 h-3 text-gray-400" />
                      {post.author}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer">
                  {post.title}
                </h3>

                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {post.snippet}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#243042]/50 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#16202e] text-gray-400 border border-[#243042]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-gray-400">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentsCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar: Guidelines & Trending */}
        <div className="space-y-5">
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {["Google", "Meta", "Amazon", "System Design", "DP", "L4", "Graph", "Salary", "Binary Search"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className="px-2.5 py-1 rounded-lg bg-[#161e2a] hover:bg-[#1f2937] text-gray-300 border border-[#243042] transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-5 shadow-xl space-y-3 text-xs text-gray-400">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Community Guidelines
            </h3>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Be respectful and constructive in feedback.</li>
              <li>Anonymize interviewers and non-disclosure details.</li>
              <li>Use markdown formatting for code snippets.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#243042]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Create New Discussion
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#161e2a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google L5 Interview Experience & Tips"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Interview Experience">Interview Experience</option>
                  <option value="Interview Questions">Interview Questions</option>
                  <option value="Compensation">Compensation</option>
                  <option value="Career">Career</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Google, SDE, Graph, Offer"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Content</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Share details of the problem statement, rounds, or questions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#243042]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#161e2a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 hover:from-emerald-400 hover:to-teal-400 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
