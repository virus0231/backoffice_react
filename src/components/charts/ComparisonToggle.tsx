"use client";

import React, { useMemo, useState } from 'react';
import { clsx } from 'clsx';

import { useComparison } from '@/hooks/useComparison';
import { getDateRangeForPreset } from '@/lib/utils/dateHelpers';

interface ComparisonToggleProps {
  chartId: string;
  className?: string;
}

export default function ComparisonToggle({ chartId, className }: ComparisonToggleProps) {
  const { enabled, summary, error, presets, setRange, toggle, clear, comparison } = useComparison(chartId);
  const [isEditing, setIsEditing] = useState(false);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [preset, setPreset] = useState<string>('custom');

  // Initialize editor fields from current comparison
  React.useEffect(() => {
    if (comparison?.startDate && comparison?.endDate) {
      setStart(new Date(comparison.startDate).toISOString().slice(0, 10));
      setEnd(new Date(comparison.endDate).toISOString().slice(0, 10));
      setPreset(comparison.preset || 'custom');
    }
  }, [comparison?.startDate, comparison?.endDate, comparison?.preset]);

  const onSave = () => {
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (!startDate || !endDate) return;
    const ok = setRange({ startDate, endDate, preset: preset as any });
    if (ok) setIsEditing(false);
  };

  const onPreset = (val: string) => {
    setPreset(val);
    if (val !== 'custom') {
      const range = getDateRangeForPreset(val as any);
      setStart(range.startDate.toISOString().slice(0, 10));
      setEnd(range.endDate.toISOString().slice(0, 10));
    }
  };

  const statusDot = useMemo(() => (
    <span className={clsx('inline-block w-2 h-2 rounded-full', enabled ? 'bg-emerald-500' : 'bg-slate-300')} />
  ), [enabled]);

  return (
    <div className={clsx('flex flex-col gap-2 text-sm', className)}>
      <div className="flex items-center gap-2">
        {statusDot}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => toggle(e.target.checked)}
            aria-label="Enable comparison period"
          />
          <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300 peer-checked:bg-emerald-500 transition-colors">
            <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:left-4" />
          </span>
          <span className="font-medium">Compare to period</span>
        </label>

        {enabled && (
          <div className="ml-auto flex items-center gap-2">
            {summary && <span className="text-slate-600">{summary}</span>}
            <button
              type="button"
              className="px-2 py-1 rounded border text-slate-700 hover:bg-slate-50"
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? 'Close' : 'Edit'}
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => clear()}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600" role="alert">
          {error}
        </div>
      )}

      {enabled && isEditing && (
        <div className="rounded border p-3 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500">Preset</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={preset}
                onChange={(e) => onPreset(e.target.value)}
              >
                <option value="custom">Custom</option>
                {presets.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Start date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">End date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1 rounded border text-slate-700 hover:bg-slate-50"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
