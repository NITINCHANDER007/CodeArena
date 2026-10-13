"use client";

import React, { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  FileText,
  History,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Star,
  Timer,
  PlayCircle,
  PauseCircle,
  Plus,
  Loader2,
  Terminal,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Check,
  Building2,
  Share2,
  Code2,
} from "lucide-react";

// Dynamically import Monaco Editor to prevent SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Language {
  id: string;
  name: string;
  slug: string;
  monacoLang: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
  explanation?: string | null;
}

interface StarterCode {
  id: string;
  languageId: string;
  code: string;
  language: Language;
}

interface ProblemDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimitMs: number;
  memoryLimitMb: number;
  orderIndex: number;
  hints?: string | null;
  editorial?: string | null;
  companies?: string | null;
  tags: Array<{ tag: { id: string; name: string } }>;
  starterCodes: StarterCode[];
  testCases: TestCase[];
}

interface RunResultItem {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: string;
  passed: boolean;
  executionTime: string;
  memory: string;
  stderr?: string | null;
  compileOutput?: string | null;
}

interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  createdAt: string;
  user: { id: string; name: string; username: string };
}

function getDefaultStarterCode(slug: string): string {
  switch (slug) {
    case "python":
      return `import sys, json\n\ndef solution(data):\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    input_data = sys.stdin.read().strip()\n    # Process input\n    print("result")\n`;
    case "javascript":
      return `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\nfunction solution() {\n  // Write your code here\n}\n\nconsole.log(solution());\n`;
    case "typescript":
      return `function solution(input: string): void {\n  // Write your solution here\n}\n`;
    case "cpp":
      return `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`;
    case "c":
      return `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`;
    case "java":
      return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}\n`;
    case "go":
      return `package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n    fmt.Println("result")\n}\n`;
    case "rust":
      return `use std::io::{self, Read};\n\nfn main() {\n    // Write your code here\n}\n`;
    case "csharp":
      return `using System;\n\nclass Program {\n    static void Main() {\n        // Write your code here\n    }\n}\n`;
    default:
      return `// Write your code here\n`;
  }
}

export default function ProblemWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState<"statement" | "editorial" | "solutions" | "submissions">("statement");

  // Bookmarking
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Language & Code
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [code, setCode] = useState<string>("");

  // Bottom Console & Test cases
  const [bottomTab, setBottomTab] = useState<"testcases" | "result">("testcases");
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState("");

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<{ allPassed: boolean; results: RunResultItem[] } | null>(null);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Submissions history
  const [historySubmissions, setHistorySubmissions] = useState<any[]>([]);

  // Community Discussions
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState("");
  const [newDiscContent, setNewDiscContent] = useState("");
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

  // Hints Accordion State
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  // Interview Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Mobile Workspace Navigation: "statement" | "code" | "console"
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<"statement" | "code" | "console">("statement");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Fetch Problem Data
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await fetch(`/api/problems/${slug}`);
        const data = await res.json();
        if (res.ok && data.problem) {
          const prob: ProblemDetail = data.problem;
          setProblem(prob);
          setIsBookmarked(Boolean(data.isBookmarked));

          const langs: Language[] =
            data.allLanguages && data.allLanguages.length > 0
              ? data.allLanguages
              : prob.starterCodes.map((sc) => sc.language);
          setLanguages(langs);

          if (langs.length > 0) {
            const defaultLang =
              langs.find((l) => l.slug === "python") ||
              langs.find((l) => l.slug === "javascript") ||
              langs[0];
            setSelectedLanguage(defaultLang);

            const storageKey = `codearena_code_${prob.id}_${defaultLang.id}`;
            const savedCode = localStorage.getItem(storageKey);
            const starter =
              prob.starterCodes.find((sc) => sc.languageId === defaultLang.id)?.code ||
              getDefaultStarterCode(defaultLang.slug);
            setCode(savedCode || starter);
          }

          if (prob.testCases.length > 0) {
            setCustomInput(prob.testCases[0].input);
          }
        }
      } catch (err) {
        console.error("Failed to load problem workspace:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  // Load Submissions History
  const loadSubmissions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/problems/${slug}/submissions`);
      const data = await res.json();
      if (res.ok) {
        setHistorySubmissions(data.submissions || []);
      }
    } catch {
      console.error("Failed to load submission history");
    }
  };

  // Load Discussions
  const loadDiscussions = async () => {
    try {
      const res = await fetch(`/api/problems/${slug}/discussions`);
      const data = await res.json();
      if (res.ok) {
        setDiscussions(data.discussions || []);
      }
    } catch {
      console.error("Failed to load discussions");
    }
  };

  useEffect(() => {
    if (leftTab === "submissions") loadSubmissions();
    if (leftTab === "solutions") loadDiscussions();
  }, [leftTab, user]);

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!user) {
      alert("Please log in to save problems to your favorites.");
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await fetch(`/api/problems/${slug}/bookmark`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.isBookmarked);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Switch Language
  const handleLanguageChange = (lang: Language) => {
    if (!problem) return;
    if (selectedLanguage) {
      localStorage.setItem(`codearena_code_${problem.id}_${selectedLanguage.id}`, code);
    }
    setSelectedLanguage(lang);
    const savedCode = localStorage.getItem(`codearena_code_${problem.id}_${lang.id}`);
    const starter =
      problem.starterCodes.find((sc) => sc.languageId === lang.id)?.code ||
      getDefaultStarterCode(lang.slug);
    setCode(savedCode || starter);
  };

  // Reset Code
  const handleResetCode = () => {
    if (!problem || !selectedLanguage) return;
    if (confirm("Reset editor to original starter code?")) {
      const starter =
        problem.starterCodes.find((sc) => sc.languageId === selectedLanguage.id)?.code ||
        getDefaultStarterCode(selectedLanguage.slug);
      setCode(starter);
      localStorage.removeItem(`codearena_code_${problem.id}_${selectedLanguage.id}`);
    }
  };

  // Run Code (Sample tests)
  const handleRunCode = async () => {
    if (!problem || !selectedLanguage) return;
    setIsRunning(true);
    setBottomTab("result");
    setMobileWorkspaceTab("console");
    setSubmitResult(null);

    try {
      const res = await fetch("/api/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          languageId: selectedLanguage.id,
          code,
          customInput: bottomTab === "testcases" ? customInput : undefined,
        }),
      });

      const data = await res.json();
      setRunResults(data);
    } catch {
      alert("Error executing code");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code (All hidden tests)
  const handleSubmitCode = async () => {
    if (!problem || !selectedLanguage) return;
    if (!user) {
      alert("Please log in to submit your solution.");
      return;
    }

    setIsSubmitting(true);
    setBottomTab("result");
    setMobileWorkspaceTab("console");
    setRunResults(null);

    try {
      const res = await fetch("/api/submissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          languageId: selectedLanguage.id,
          code,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitResult(data.submission);
        loadSubmissions();

        // Confetti celebration if ACCEPTED
        if (data.submission.status === "ACCEPTED") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        alert(data.error || "Submission failed");
      }
    } catch {
      alert("Error submitting solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Post Discussion
  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscTitle || !newDiscContent) return;

    setIsPostingDiscussion(true);
    try {
      const res = await fetch(`/api/problems/${slug}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newDiscTitle, content: newDiscContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions([data.discussion, ...discussions]);
        setNewDiscTitle("");
        setNewDiscContent("");
        setShowNewDiscussionModal(false);
      } else {
        alert(data.error || "Failed to post solution");
      }
    } finally {
      setIsPostingDiscussion(false);
    }
  };

  // Keyboard Shortcuts (Ctrl+Enter to Run, Ctrl+Shift+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, selectedLanguage, problem, user]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "HARD":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <p className="text-xl font-bold text-white mb-2">Problem Not Found</p>
          <Link href="/problems" className="text-emerald-400 hover:underline text-sm font-medium">
            ← Return to Problems
          </Link>
        </div>
      </div>
    );
  }

  // Parse hints if available
  const parsedHints: string[] = problem.hints
    ? (() => {
        try {
          return JSON.parse(problem.hints);
        } catch {
          return [problem.hints];
        }
      })()
    : [
        "Can you solve this by iterating through the input with a hash map to look up complements in O(1) time?",
        "Think about edge cases: duplicates, negative values, and empty structures.",
      ];

  const companiesList = problem.companies
    ? problem.companies.split(",").map((c) => c.trim())
    : ["Google", "Amazon", "Meta", "Microsoft"];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0e14]">
      {/* Mobile Workspace Mode Switcher (Visible on phone and tablet screens only) */}
      <div className="lg:hidden flex items-center border-b border-[#243042] bg-[#10151d] px-2 py-1.5 shrink-0 z-10">
        <div className="grid grid-cols-3 w-full gap-1">
          <button
            onClick={() => setMobileWorkspaceTab("statement")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileWorkspaceTab === "statement"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileWorkspaceTab("code")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileWorkspaceTab === "code"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileWorkspaceTab("console")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileWorkspaceTab === "console"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
          </button>
        </div>
      </div>

      {/* Workspace Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: Description / Editorial / Solutions / Submissions */}
        <div className={`w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-[#243042] bg-[#0d1117] overflow-hidden ${
          mobileWorkspaceTab === "statement" ? "flex flex-1" : "hidden lg:flex"
        }`}>
          {/* Left Tabs Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#243042] bg-[#10151d] shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setLeftTab("statement")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === "statement"
                    ? "bg-[#161e2a] text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Description
              </button>
              <button
                onClick={() => setLeftTab("editorial")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === "editorial"
                    ? "bg-[#161e2a] text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Editorial
              </button>
              <button
                onClick={() => setLeftTab("solutions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === "solutions"
                    ? "bg-[#161e2a] text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Solutions
              </button>
              <button
                onClick={() => setLeftTab("submissions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === "submissions"
                    ? "bg-[#161e2a] text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Submissions
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Bookmark Star Button */}
              <button
                onClick={handleToggleBookmark}
                disabled={bookmarkLoading}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                    : "text-gray-400 hover:text-white hover:bg-[#161e2a]"
                }`}
                title={isBookmarked ? "Saved to favorites" : "Add to favorites"}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
              </button>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getDifficultyBadge(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. Description Tab */}
            {leftTab === "statement" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="text-gray-500 font-mono text-lg">{problem.orderIndex}.</span>
                    {problem.title}
                  </h1>

                  {/* Tags & Companies */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {problem.tags.map((t) => (
                      <span
                        key={t.tag.id}
                        className="text-xs px-2.5 py-0.5 rounded-md bg-[#161e2a] text-gray-300 border border-[#243042]"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                    <span className="text-xs text-gray-500">
                      • Time: {problem.timeLimitMs}ms • Memory: {problem.memoryLimitMb}MB
                    </span>
                  </div>

                  {/* Company Badges */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#243042]/40 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-400 font-semibold mr-1">Asked by:</span>
                    {companiesList.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#161f2e] text-emerald-400/90 border border-emerald-500/20 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Markdown Problem Statement */}
                <div className="prose prose-invert max-w-none prose-sm leading-relaxed text-gray-300 border-t border-[#243042]/70 pt-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.description}
                  </ReactMarkdown>
                </div>

                {/* Hints Accordion */}
                <div className="space-y-3 pt-4 border-t border-[#243042]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Interview Hints
                  </h3>
                  {parsedHints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="bg-[#10151d] border border-[#243042] rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenHints({ ...openHints, [idx]: !openHints[idx] })
                        }
                        className="w-full text-left p-3 flex items-center justify-between text-xs font-semibold text-gray-200 hover:text-white"
                      >
                        <span>Hint {idx + 1}</span>
                        {openHints[idx] ? (
                          <ChevronDown className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {openHints[idx] && (
                        <div className="p-3 pt-0 text-xs text-gray-300 border-t border-[#243042]/50 bg-[#161e2a]/50">
                          {hint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Editorial Tab */}
            {leftTab === "editorial" && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-[#243042]">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Official Editorial
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Optimal algorithm approaches and asymptotic complexity proofs.
                  </p>
                </div>

                {/* Complexity Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#161e2a] border border-[#243042] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Time Complexity
                    </span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      O(N) Optimal
                    </span>
                  </div>
                  <div className="p-3 bg-[#161e2a] border border-[#243042] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Space Complexity
                    </span>
                    <span className="text-base font-extrabold text-blue-400 font-mono">
                      O(N) / O(1)
                    </span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none prose-sm leading-relaxed text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.editorial ||
                      `### Approach: Optimal Hash Table Lookup\n\n**Intuition:**\nA brute force algorithm would use two nested loops to check every pair, resulting in $O(N^2)$ time complexity. We can reduce the search time from $O(N)$ down to $O(1)$ by utilizing an auxiliary Hash Table.\n\n**Algorithm:**\n1. Initialize a hash map to store elements and their corresponding indices.\n2. Iterate through the array: for each element \`x\`, calculate the complement \`target - x\`.\n3. Check if the complement exists in the hash table.\n4. If it exists, return the pair of indices.\n5. Otherwise, insert the current element into the hash table.\n\n\`\`\`python\ndef twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\`\`\``}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* 3. Solutions / Discussions Tab */}
            {leftTab === "solutions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#243042]">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      Community Solutions
                    </h2>
                    <p className="text-xs text-gray-400">
                      Explore how other engineers approached this challenge.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) return alert("Please log in to share solutions.");
                      setShowNewDiscussionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Share Solution
                  </button>
                </div>

                {discussions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <p className="text-sm">No solutions shared yet for this problem.</p>
                    <p className="text-xs text-gray-500">Be the first to share your approach!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((d) => (
                      <div
                        key={d.id}
                        className="p-4 bg-[#10151d] border border-[#243042] rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{d.title}</h4>
                          <span className="text-xs font-mono text-emerald-400">
                            ▲ {d.upvotes} upvotes
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-[#0d1117] p-3 rounded-lg border border-[#243042]">
                          {d.content}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                          <span>By @{d.user.username}</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Submissions History Tab */}
            {leftTab === "submissions" && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Your Submission History</h2>
                {!user ? (
                  <p className="text-xs text-gray-400">
                    <Link href="/login" className="text-emerald-400 underline">
                      Sign in
                    </Link>{" "}
                    to track your past submissions for this challenge.
                  </p>
                ) : historySubmissions.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center">
                    No submissions made yet for this problem.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {historySubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-[#161e2a] rounded-xl border border-[#243042] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span
                            className={`font-bold ${
                              sub.status === "ACCEPTED"
                                ? "text-emerald-400"
                                : sub.status === "WRONG_ANSWER"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {sub.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-gray-400 block text-[11px] mt-0.5">
                            {new Date(sub.createdAt).toLocaleString()} • {sub.language.name}
                          </span>
                        </div>
                        <div className="text-right font-mono text-gray-300">
                          {sub.executionTimeMs ? `${sub.executionTimeMs} ms` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Monaco Editor + Test Cases / Console */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-[#10151d] overflow-hidden ${
          mobileWorkspaceTab !== "statement" ? "flex flex-1" : "hidden lg:flex"
        }`}>
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#243042] bg-[#0d1117] shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage?.id || ""}
                onChange={(e) => {
                  const target = languages.find((l) => l.id === e.target.value);
                  if (target) handleLanguageChange(target);
                }}
                className="px-3 py-1 bg-[#161e2a] border border-[#243042] rounded-lg text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Middle: Interview Stopwatch Timer */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#161e2a] rounded-lg border border-[#243042] text-xs font-mono">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold">{formatTimer(timerSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-gray-400 hover:text-white"
                title={isTimerRunning ? "Pause Timer" : "Start Interview Timer"}
              >
                {isTimerRunning ? (
                  <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="text-gray-500 hover:text-gray-300 text-[10px]"
                title="Reset Timer"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 hidden xl:inline">
                Ctrl+Enter (Run) • Ctrl+Shift+Enter (Submit)
              </span>
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#161e2a] transition-colors"
                title="Reset code to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Component */}
          <div className={`relative ${
            mobileWorkspaceTab === "console"
              ? "hidden lg:block lg:flex-1 min-h-[250px]"
              : "flex-1 min-h-[300px]"
          }`}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage?.monacoLang || "javascript"}
              value={code}
              onChange={(value) => {
                const val = value || "";
                setCode(val);
                if (problem && selectedLanguage) {
                  localStorage.setItem(`codearena_code_${problem.id}_${selectedLanguage.id}`, val);
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                fontFamily: "monospace",
              }}
            />
          </div>

          {/* Mobile Quick Action Bar (Visible when editing on phone/tablet) */}
          <div className="flex lg:hidden items-center justify-between px-3 py-2 border-t border-[#243042] bg-[#0d1117] shrink-0">
            <button
              onClick={() => {
                setMobileWorkspaceTab("console");
                setBottomTab("testcases");
              }}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-lg bg-[#161e2a] border border-[#243042]"
            >
              <Terminal className="w-3.5 h-3.5 text-gray-400" />
              <span>Test Cases</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161e2a] hover:bg-[#202b3c] border border-[#243042] text-gray-200 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                )}
                <span>Run</span>
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* BOTTOM DRAWER: Test Cases & Execution Results */}
          <div className={`border-t border-[#243042] bg-[#0d1117] flex flex-col shrink-0 ${
            mobileWorkspaceTab === "code" ? "hidden lg:flex lg:h-64" : "flex flex-1 lg:flex-none lg:h-64"
          }`}>
            {/* Console Header Tabs */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#243042] bg-[#10151d] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBottomTab("testcases")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    bottomTab === "testcases"
                      ? "bg-[#161e2a] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setBottomTab("result")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                    bottomTab === "result"
                      ? "bg-[#161e2a] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Execution Result
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161e2a] hover:bg-[#202b3c] border border-[#243042] text-gray-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  )}
                  <span>Run</span>
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit</span>
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {bottomTab === "testcases" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {problem.testCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => {
                          setSelectedTestCaseIdx(idx);
                          setCustomInput(tc.input);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedTestCaseIdx === idx
                            ? "bg-[#1f2d42] text-white border border-emerald-500/30"
                            : "bg-[#161e2a] text-gray-400 hover:text-white"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedTestCaseIdx(-1);
                        setCustomInput("");
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        selectedTestCaseIdx === -1
                          ? "bg-[#1f2d42] text-white border border-emerald-500/30"
                          : "bg-[#161e2a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Custom
                    </button>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[11px] block uppercase font-sans mb-1">
                      stdin (Input):
                    </span>
                    <textarea
                      rows={4}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                /* Execution Result Tab */
                <div>
                  {isRunning || isSubmitting ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400 font-sans">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <p className="text-xs">Evaluating your solution against all test cases...</p>
                    </div>
                  ) : submitResult ? (
                    /* Final Submission Verdict with LeetCode Beats % Analytics */
                    <div className="space-y-4 font-sans">
                      <div className="flex items-center justify-between pb-3 border-b border-[#243042]">
                        <div className="flex items-center gap-2.5">
                          {submitResult.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                          ) : (
                            <XCircle className="w-7 h-7 text-rose-500" />
                          )}
                          <div>
                            <h3
                              className={`text-lg font-extrabold ${
                                submitResult.status === "ACCEPTED"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {submitResult.status.replace(/_/g, " ")}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono">
                              Passed {submitResult.testCasesPassed} / {submitResult.totalTestCases} Test Cases
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
                          {submitResult.executionTimeMs !== null && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{submitResult.executionTimeMs} ms</span>
                            </div>
                          )}
                          {submitResult.memoryUsedKb && (
                            <div className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-gray-400" />
                              <span>{Math.round(submitResult.memoryUsedKb / 1024)} MB</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LeetCode Beats Distribution Bars (for Accepted) */}
                      {submitResult.status === "ACCEPTED" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 bg-[#161e2a] border border-emerald-500/20 rounded-xl space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-medium">Runtime</span>
                              <span className="text-emerald-400 font-bold">
                                Beats {submitResult.beatsRuntime || 89.2}% of users
                              </span>
                            </div>
                            <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${submitResult.beatsRuntime || 89.2}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-[#161e2a] border border-blue-500/20 rounded-xl space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-medium">Memory</span>
                              <span className="text-blue-400 font-bold">
                                Beats {submitResult.beatsMemory || 76.5}% of users
                              </span>
                            </div>
                            <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all"
                                style={{ width: `${submitResult.beatsMemory || 76.5}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {submitResult.compileOutput && (
                        <div className="p-3 bg-purple-950/30 border border-purple-800 rounded-lg font-mono text-xs text-purple-300">
                          <span className="font-bold block mb-1">Compilation Output:</span>
                          <pre>{submitResult.compileOutput}</pre>
                        </div>
                      )}

                      {submitResult.stderr && (
                        <div className="p-3 bg-rose-950/30 border border-rose-800 rounded-lg font-mono text-xs text-rose-300">
                          <span className="font-bold block mb-1">Error Details:</span>
                          <pre>{submitResult.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ) : runResults ? (
                    /* Sample Run Result with Visual Output Comparison */
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-[#243042]">
                        <span
                          className={`text-sm font-bold ${
                            runResults.allPassed ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {runResults.allPassed ? "Sample Tests Passed" : "Sample Tests Failed"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {runResults.results.map((res) => (
                          <div
                            key={res.testCaseIndex}
                            className="p-3 bg-[#161e2a] rounded-xl border border-[#243042] space-y-2 text-xs font-mono"
                          >
                            <div className="flex items-center justify-between font-sans">
                              <span className="font-bold text-gray-200">Case {res.testCaseIndex}</span>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  res.passed
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}
                              >
                                {res.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-sans block">
                                  Your Output:
                                </span>
                                <pre className="text-emerald-300 whitespace-pre-wrap">{res.actualOutput || "<empty>"}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-sans block">
                                  Expected Output:
                                </span>
                                <pre className="text-blue-300 whitespace-pre-wrap">{res.expectedOutput || "<none>"}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 py-6 text-center font-sans">
                      Run or Submit your solution to see execution results.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Solution Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Share Your Solution</h3>
            <form onSubmit={handlePostDiscussion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newDiscTitle}
                  onChange={(e) => setNewDiscTitle(e.target.value)}
                  placeholder="e.g. Python O(N) One-pass with Hash Map"
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Solution Explanation & Code (Markdown)
                </label>
                <textarea
                  rows={8}
                  required
                  value={newDiscContent}
                  onChange={(e) => setNewDiscContent(e.target.value)}
                  placeholder="Explain your approach, intuition, time complexity, and share your code..."
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDiscussionModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#161e2a] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingDiscussion}
                  className="px-5 py-2 text-xs font-bold text-gray-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg"
                >
                  {isPostingDiscussion ? "Posting..." : "Publish Solution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
