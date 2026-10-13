import Link from "next/link";
import {
  Code2,
  Trophy,
  Zap,
  Terminal,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 px-4 sm:px-6 lg:px-8 border-b border-[#243042]">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Algorithmic Practice Arena</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            Code, Execute, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500">
              Conquer the Arena
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sharpen your data structures and algorithmic mastery with real-time Judge0 execution,
            Monaco code editor, comprehensive test suites, and live competitive leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/problems"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Explore Problems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/leaderboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#161f2e] hover:bg-[#1f2d42] border border-[#243042] text-white font-semibold text-sm transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Global Leaderboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built for Peak Performance
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            A battle-tested tech stack tailored for technical interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#10151d] border border-[#243042] p-6 rounded-3xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Monaco Code Editor</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              VS Code-grade editing experience with syntax highlighting, automatic indentation, and
              instant code reset per language.
            </p>
          </div>

          <div className="bg-[#10151d] border border-[#243042] p-6 rounded-3xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Judge0 Sandbox</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submissions run safely inside isolated Docker containers with hard limits on CPU time,
              memory ceilings, and network sandboxing.
            </p>
          </div>

          <div className="bg-[#10151d] border border-[#243042] p-6 rounded-3xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              httpOnly JWT cookies, account lockout protection against brute-force attacks, and RBAC
              admin defenses.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="mt-auto py-12 border-t border-[#243042] bg-[#0d1117] text-center px-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} CodeArena. All rights reserved. Built with Next.js, Prisma & Judge0.
        </p>
      </section>
    </div>
  );
}
