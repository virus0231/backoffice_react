"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useFilterStore } from '@/stores/filterStore';
import { clearCache } from '@/lib/cache/apiCache';
import { CLIENTS } from '@/components/filters/ClientSwitcher';
import { clsx } from 'clsx';
import { BrandLogo, PoweredByYOC } from '@/components/common/Brand';

export default function ProfilePanel() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { selectedClient, setSelectedClient } = useFilterStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<number>(-1);
  const [toast, setToast] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const filtered = useMemo(() => filteredClientList(query), [query]);
  const selectClient = (clientId: string) => {
    if (clientId === selectedClient) {
      setModalOpen(false);
      setQuery('');
      setHighlight(-1);
      return;
    }
    setSelectedClient(clientId);
    clearCache();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('api-cache-') || key.startsWith('insights_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
    setModalOpen(false);
    const targetName = clientName(clientId);
    setToast(`Switched to ${targetName}. Reloading…`);
    setTimeout(() => setToast(null), 2200);
    setTimeout(() => window.location.reload(), 1200);
  };

  // Always call hooks in the same order; derive values safely with optional chaining
  const initial = useMemo(() => {
    const src = (user?.fullName || user?.username || '?').trim();
    return src ? src.charAt(0).toUpperCase() : '?';
  }, [user?.fullName, user?.username]);

  const onLogout = () => {
    logout();
    router.replace('/login');
  };

  const rolePillHeader = 'bg-white/20 text-white border border-white/30 backdrop-blur-sm';
  const roleClasses = ((user?.role || 'user') === 'admin')
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

  if (!user) return null;

  return (
    <>
    <aside className="hidden lg:block w-80 self-start">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
        {/* Gradient background with pattern */}
        <div className="relative h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          {/* Logo */}
          <div className="absolute right-4 top-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
              <BrandLogo className="h-4 w-auto drop-shadow-sm" title="YOC" />
            </div>
          </div>

          {/* User info */}
          <div className="absolute left-6 bottom-4 right-6">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
                <div className="relative w-16 h-16 rounded-full bg-white ring-4 ring-white/30 flex items-center justify-center shadow-xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-inner">
                    {initial}
                  </div>
                </div>
              </div>

              {/* Name and role */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white leading-tight truncate drop-shadow-sm" title={(user.fullName || user.username) || ''}>
                  {user.fullName || user.username}
                </h3>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/25 text-white border border-white/30 backdrop-blur-sm">
                  {user.role || 'user'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Client section */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Active Client
            </label>
            <div className="group relative">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 blur-sm opacity-50" style={avatarStyleFor(selectedClient)} />
                    <span
                      className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold text-white shadow-lg"
                      style={avatarStyleFor(selectedClient)}
                    >
                      {initials(clientName(selectedClient)).slice(0,2)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate" title={clientName(selectedClient)}>
                    {clientName(selectedClient)}
                  </span>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Actions */}
          <div className="space-y-3">
            {/* Monitoring Dashboard Link */}
            <button
              onClick={() => router.push('/monitoring')}
              className="group relative w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Website Monitoring
              </div>
            </button>

            {/* Analytics Dashboard Link */}
            <button
              onClick={() => router.push('/')}
              className="group relative w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics Dashboard
              </div>
            </button>

            <button
              onClick={onLogout}
              className="group relative w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="pt-2">
            <PoweredByYOC className="justify-center" />
          </div>
        </div>
      </div>

      {/* Client modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)} />

          {/* Modal */}
          <div ref={modalRef} className="relative w-full max-w-md animate-slide-up">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
              {/* Gradient header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
                <div className="absolute inset-0 bg-white/10" />
                <div className="relative">
                  <h4 className="text-lg font-bold text-white mb-1">Switch Client</h4>
                  <p className="text-sm text-white/80">Select a client to load its data</p>
                </div>
              </div>

              {/* Search */}
              <div className="p-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 group-focus-within:bg-white group-focus-within:border-transparent group-focus-within:ring-2 group-focus-within:ring-blue-500 transition-all">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setHighlight(-1); }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
                        if (e.key === 'Enter' && highlight >= 0 && filtered[highlight]) { selectClient(filtered[highlight].id); }
                        if (e.key === 'Escape') { setModalOpen(false); }
                      }}
                      placeholder="Search clients..."
                      className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Client list */}
                <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-gray-200">
                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-500 font-medium">No clients found</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                  {filtered.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => selectClient(c.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 last:border-b-0',
                        c.id === selectedClient
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                          : 'hover:bg-gray-50',
                        highlight === idx && 'bg-gray-50 ring-2 ring-inset ring-blue-200'
                      )}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 blur-sm opacity-40" style={avatarStyleFor(c.id)} />
                        <span
                          className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold text-white shadow-lg"
                          style={avatarStyleFor(c.id)}
                        >
                          {initials(c.name).slice(0,2)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold truncate flex-1">{c.name}</span>
                      {c.id === selectedClient && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600">Active</span>
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => { setModalOpen(false); setQuery(''); setHighlight(-1); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>

    {/* Toast */}
    {toast && (
      <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 shadow-2xl backdrop-blur-xl border border-green-400/50">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{toast}</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function clientName(id: string): string {
  const c = CLIENTS.find(x => x.id === id);
  return c?.name || id;
}

function filteredClientList(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return CLIENTS;
  return CLIENTS.filter(c => c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? parts[1]?.[0] || '' : '';
  return (a + b).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function avatarStyleFor(id: string): React.CSSProperties {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return { backgroundColor: `hsl(${hue} 85% 45% / 1)` };
}





