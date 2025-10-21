"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { BrandLogo, PoweredByYOC } from "@/components/common/Brand";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [capsOn, setCapsOn] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("insights-last-username");
      if (saved) setUsername(saved);
    } catch {}
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (ok) {
      setToast({ type: "success", message: "Signed in. Redirecting…" });
      setTimeout(() => setToast(null), 2500);
      setTimeout(() => router.replace("/"), 700);
    } else {
      setToast({ type: "error", message: "Invalid username or password" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 p-4">
          <div className="absolute right-3 top-2 opacity-95">
            <BrandLogo className="h-5 w-auto drop-shadow-sm" />
          </div>
          <h1 className="text-white text-base font-semibold">Sign in</h1>
          <p className="text-white/80 text-xs">
            Access your Insights dashboard
          </p>
        </div>

        <div className="p-5">
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 16a6 6 0 1112 0v.5A1.5 1.5 0 0112.5 18h-9A1.5 1.5 0 012 16.5V16z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  autoComplete="username"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 8a5 5 0 1110 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm2 0a3 3 0 116 0v2H7V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18M10.584 10.59A2 2 0 0112 10a2 2 0 012 2c0 .45-.148.868-.398 1.203M9.88 5.64A9.953 9.953 0 0112 5c5 0 9 4 9 7- .31.85-1.37 2.28-2.93 3.5M6.11 6.11C4 7.7 3 9.3 3 12c.31.85 1.37 2.28 2.93 3.5 1.09.86 2.35 1.53 3.72 1.92"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-3 py-2 text-sm transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <PoweredByYOC className="mt-4 justify-center" />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ring-1 ring-black/10 ${toast.type === "success" ? "bg-gray-900 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-4 h-4 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : toast.type === "error" ? (
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.602c.75 1.336-.213 2.999-1.743 2.999H3.482c-1.53 0-2.493-1.663-1.743-2.999L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M18 13V7a2 2 0 00-2-2h-1V4a3 3 0 10-6 0v1H8a2 2 0 00-2 2v6H4a2 2 0 000 4h12a2 2 0 000-4h-2zM9 5a1 1 0 112 0v1H9V5z" />
              </svg>
            )}
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
