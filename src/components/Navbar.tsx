"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Code2,
  Trophy,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Flame,
  Coins,
  MessageSquare,
  Star,
  Swords,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-[#243042]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Code<span className="text-emerald-400">Arena</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/problems"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/problems")
                    ? "bg-[#1f2937] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#161f2e]"
                }`}
              >
                Problems
              </Link>
              <Link
                href="/contest"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive("/contest")
                    ? "bg-[#1f2937] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#161f2e]"
                }`}
              >
                <Swords className="w-4 h-4 text-rose-400" />
                Contest
              </Link>
              <Link
                href="/discuss"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive("/discuss")
                    ? "bg-[#1f2937] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#161f2e]"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Discuss
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive("/leaderboard")
                    ? "bg-[#1f2937] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#161f2e]"
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive("/admin")
                      ? "bg-rose-950/40 text-rose-400 border border-rose-800/40"
                      : "text-rose-400 hover:bg-rose-950/20"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right Section: Auth & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 bg-gray-800/50 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* LeetCode Streak & LeetCoins Badges */}
                <div className="flex items-center gap-2 bg-[#161f2e] border border-[#243042] px-3 py-1.5 rounded-xl text-xs font-semibold">
                  <span className="flex items-center gap-1 text-orange-400 hover:text-orange-300 cursor-pointer" title="5 Day Solving Streak">
                    <Flame className="w-4 h-4 fill-orange-400/20 text-orange-400 animate-pulse" />
                    5
                  </span>
                  <span className="text-gray-600">|</span>
                  <span className="flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer" title="180 CodeArena Coins">
                    <Coins className="w-4 h-4 text-amber-400" />
                    180
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#161f2e] border border-[#243042] hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {user.username.slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{user.username}</span>
                    {user.role === "ADMIN" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Admin
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-[#161f2e] border border-[#243042] rounded-xl shadow-2xl py-1.5 z-50 text-sm"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-[#243042]">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-400">
                          <span className="font-mono">Rating: 2,150 (Knight)</span>
                        </div>
                      </div>

                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#1f2d42] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                        My Profile
                      </Link>

                      <Link
                        href="/problems?status=bookmarked"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#1f2d42] transition-colors"
                      >
                        <Star className="w-4 h-4 text-amber-400" />
                        Starred Problems
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-[#1f2d42] transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-[#1f2d42] transition-colors border-t border-[#243042]"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-gray-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#243042] bg-[#0d1117] px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-[#161f2e]"
          >
            Problems
          </Link>
          <Link
            href="/contest"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-[#161f2e]"
          >
            Contest
          </Link>
          <Link
            href="/discuss"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-[#161f2e]"
          >
            Discuss
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-[#161f2e]"
          >
            Leaderboard
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-rose-400 hover:bg-[#161f2e]"
            >
              Admin Panel
            </Link>
          )}
          {user ? (
            <div className="pt-2 border-t border-[#243042] space-y-2">
              <Link
                href={`/profile/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-[#161f2e]"
              >
                Profile ({user.username})
              </Link>
              <Link
                href="/problems?status=bookmarked"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-300 hover:bg-[#161f2e]"
              >
                Starred Problems
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-[#161f2e]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#243042] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-gray-200 bg-[#161f2e] rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-gray-950 bg-emerald-400 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
