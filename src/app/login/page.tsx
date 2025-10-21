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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Centered container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Login card */}
        <div className="relative w-full max-w-md animate-slide-up">
        {/* Glass card with backdrop blur */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Logo section */}
          <div className="pt-12 pb-6 px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse-slow" />
                <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                  <BrandLogo className="h-16 w-auto" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to access your Insights dashboard
            </p>
          </div>

          {/* Form section */}
          <div className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Username field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg
                        className="w-5 h-5"
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
                      className="relative w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                      autoComplete="username"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg
                        className="w-5 h-5"
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
                      className="relative w-full pl-12 pr-12 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.098.5-2.218 1.393-3.299m3.88-2.48A9.953 9.953 0 0112 5c5 0 9 4 9 7a10.004 10.004 0 01-1.875 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
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
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-70 group-hover:opacity-100" />
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in to Dashboard"
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8">
              <PoweredByYOC className="justify-center" />
            </div>
          </div>
        </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400/50 text-white"
                : toast.type === "error"
                ? "bg-red-500/90 border-red-400/50 text-white"
                : "bg-blue-500/90 border-blue-400/50 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-6 h-6 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : toast.type === "error" ? (
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
