"use client";

import React from 'react';
import { clsx } from 'clsx';

import { useComparison } from '@/hooks/useComparison';

interface ComparisonIndicatorProps {
  chartId: string;
  className?: string;
}

export default function ComparisonIndicator({ chartId, className }: ComparisonIndicatorProps) {
  const { enabled, summary, clear } = useComparison(chartId);

  if (!enabled) {
    return (
      <div className={clsx('inline-flex items-center gap-1 text-xs text-slate-500', className)}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span>No comparison</span>
      </div>
    );
  }

  return (
    <div className={clsx('inline-flex items-center gap-2 text-xs', className)}>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Comparison</span>
      </span>
      {summary && <span className="text-slate-600">{summary}</span>}
      <button
        type="button"
        className="ml-1 px-1.5 py-0.5 border rounded text-slate-600 hover:bg-slate-50"
        onClick={() => clear()}
      >
        Clear
      </button>
    </div>
  );
}
