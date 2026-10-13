"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strengthScore = Object.values(rules).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#10151d] border border-[#243042] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-gray-400 mt-1">Set a strong new password for your account</p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-300">Password Updated!</h3>
            <p className="text-sm text-gray-300">
              Your password has been reset and all previous sessions have been logged out.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md transition-colors"
              >
                <span>Log In With New Password</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10 transition-colors"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full transition-all ${
                          idx <= strengthScore
                            ? strengthScore <= 2
                              ? "bg-rose-500"
                              : strengthScore <= 4
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                            : "bg-[#243042]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400 pt-1">
                    <span className={rules.length ? "text-emerald-400" : ""}>✓ 8+ chars</span>
                    <span className={rules.upper ? "text-emerald-400" : ""}>✓ Uppercase</span>
                    <span className={rules.lower ? "text-emerald-400" : ""}>✓ Lowercase</span>
                    <span className={rules.number ? "text-emerald-400" : ""}>✓ Number</span>
                    <span className={rules.special ? "text-emerald-400" : ""}>✓ Symbol</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

