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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header with name in blue area and avatar */}
        <div className="relative h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500">
          <div className="absolute right-3 top-2 opacity-95">
            <BrandLogo className="h-5 w-auto drop-shadow-sm" title="YOC" />
          </div>
          <div className="absolute left-5 bottom-1 text-white flex items-center gap-2">
            <h3 className="text-sm font-semibold leading-5 truncate max-w-[10rem]" title={(user.fullName || user.username) || ''}>
              {user.fullName || user.username}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${rolePillHeader}`}>{user.role || 'user'}</span>
          </div>
          <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-full bg-white ring-2 ring-white flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-semibold">
              {initial}
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="pt-8 px-5 pb-5">
          {/* Current Client row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] text-white" style={avatarStyleFor(selectedClient)}>
                {initials(clientName(selectedClient)).slice(0,2)}
              </span>
              <span className="text-sm text-gray-900 truncate" title={clientName(selectedClient)}>{clientName(selectedClient)}</span>
            </div>
            <button onClick={() => setModalOpen(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Change
            </button>
          </div>

          {/* Actions */}
          <div className="mt-5">
            <button
              onClick={onLogout}
              className="w-full px-3 py-2 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
          <PoweredByYOC className="mt-4 justify-center" />
        </div>
      </div>

      {/* Client modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div ref={modalRef} className="relative mx-auto mt-24 w-[min(92vw,420px)] rounded-xl bg-white shadow-2xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Switch client</h4>
              <p className="text-xs text-gray-500">Pick a client to load its data</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  placeholder="Search clients"
                  className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1"
                  autoFocus
                />
              </div>
              <div className="mt-3 max-h-64 overflow-auto divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <div className="text-sm text-gray-500 py-3 text-center">No matches</div>
                )}
                {filtered.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => selectClient(c.id)}
                    className={clsx('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      c.id === selectedClient ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50',
                      highlight === idx && 'bg-gray-50'
                    )}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] text-white" style={avatarStyleFor(c.id)}>
                      {initials(c.name).slice(0,2)}
                    </span>
                    <span className="text-sm truncate flex-1">{c.name}</span>
                    {c.id === selectedClient && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => { setModalOpen(false); setQuery(''); setHighlight(-1); }} className="px-3 py-1.5 text-xs rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </aside>

    {/* Toast */}
    {toast && (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg bg-gray-900 text-white px-4 py-3 shadow-lg ring-1 ring-black/10">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{toast}</span>
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





