"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Email verification failed or token has expired.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error occurred while verifying email.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#10151d] border border-[#243042] rounded-2xl p-8 text-center shadow-2xl">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying Email...</h2>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md transition-colors"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-[#161e2a] hover:bg-[#1f2d42] text-white border border-[#243042] text-sm font-medium transition-colors"
              >
                Back to Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
