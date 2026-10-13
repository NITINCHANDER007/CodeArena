"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileCode2,
  Users,
  Send,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="bg-[#10151d] border border-rose-900/50 p-8 rounded-2xl max-w-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6">
            You do not have administrative privileges to access this area.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Problems", href: "/admin/problems", icon: FileCode2 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Submissions", href: "/admin/submissions", icon: Send },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isCurrent = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#0a0e14]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0d1117] border-b md:border-b-0 md:border-r border-[#243042] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#243042] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Admin Portal
            </span>
          </div>
          <Link
            href="/problems"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> App
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white hover:bg-[#161f2e]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
