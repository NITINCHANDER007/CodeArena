"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successInfo, setSuccessInfo] = useState<{ message: string; previewUrl?: string | null } | null>(null);

  // Password rules validation
  const rules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };
  const strengthScore = Object.values(rules).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "Signup failed. Please try again.");
      } else {
        setSuccessInfo({
          message: data.message,
          previewUrl: data.previewUrl,
        });
      }
    } catch {
      setError("Network error. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-[#10151d] border border-[#243042] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-gray-400 mt-1">Start mastering algorithms today</p>
        </div>

        {/* Success message / Verification Pending */}
        {successInfo ? (
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-300">Verify Your Email</h3>
            <p className="text-sm text-gray-300">{successInfo.message}</p>
            {successInfo.previewUrl && (
              <div className="mt-3 p-3 bg-[#0d1117] rounded-lg border border-[#243042] text-xs text-left">
                <span className="text-emerald-400 font-semibold block mb-1">
                  🧪 Dev Mailbox Preview Link:
                </span>
                <a
                  href={successInfo.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline break-all"
                >
                  {successInfo.previewUrl}
                </a>
              </div>
            )}
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-500 text-gray-950 font-semibold text-sm hover:bg-emerald-400 transition-colors"
              >
                Proceed to Log In
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Ada Lovelace"
              />
              {fieldErrors.name && (
                <p className="text-xs text-rose-400 mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="adalovelace"
              />
              {fieldErrors.username && (
                <p className="text-xs text-rose-400 mt-1">{fieldErrors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161e2a] border border-[#243042] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="ada@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-400 mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              {/* Password strength indicator */}
              {formData.password && (
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
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-400 hover:underline font-semibold">
                  Sign In
                </Link>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
