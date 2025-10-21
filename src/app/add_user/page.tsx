'use client';

import React, { useState } from 'react';
import { buildAddUserUrl } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError } from '@/lib/utils/errorHandling';
import { BrandLogo, PoweredByYOC } from '@/components/common/Brand';

export default function AddUserPage() {
  const [adminKey, setAdminKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const url = buildAddUserUrl();
      const res = await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_key: adminKey,
          username,
          password,
          full_name: fullName || undefined,
          email: email || undefined,
          role
        })
      });
      const data = await parseAPIResponse<{ success: boolean; data: { id: number; username: string; role: string } }>(res);
      setMessage(`User '${data.data.username}' created successfully with ${data.data.role} role!`);
      // Clear form
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setRole('user');
      // Auto-hide success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      logError(err, 'add_user');
      setError(err instanceof Error ? err.message : 'Failed to create user');
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
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
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        {/* Form card */}
        <div className="relative w-full max-w-2xl my-8 animate-slide-up">
        {/* Glass card with backdrop blur */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Logo section */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse-slow" />
                <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                  <BrandLogo className="h-14 w-auto" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Add New User
            </h1>
            <p className="text-gray-600 text-sm">
              Create a new user account with admin privileges
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium text-amber-800">Protected by admin key</span>
            </div>
          </div>

          {/* Form section */}
          <div className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Admin Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Key <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type={showAdminKey ? "text" : "password"}
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="relative w-full pl-12 pr-12 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                      placeholder="Enter admin key"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showAdminKey ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.098.5-2.218 1.393-3.299m3.88-2.48A9.953 9.953 0 0112 5c5 0 9 4 9 7a10.004 10.004 0 01-1.875 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Username and Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 16a6 6 0 1112 0v.5A1.5 1.5 0 0112.5 18h-9A1.5 1.5 0 012 16.5V16z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                        placeholder="Username"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 8a5 5 0 1110 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm2 0a3 3 0 116 0v2H7V8z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative w-full pl-12 pr-12 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.098.5-2.218 1.393-3.299m3.88-2.48A9.953 9.953 0 0112 5c5 0 9 4 9 7a10.004 10.004 0 01-1.875 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="relative w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email and Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </span>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        className="relative w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-none appearance-none cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <span className="absolute right-4 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success/Error Messages */}
              {message && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-slide-up">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-green-800">{message}</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 animate-slide-up">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
              )}

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
                      Creating User...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create User Account
                    </span>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6">
              <PoweredByYOC className="justify-center" />
            </div>
          </div>
        </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}

