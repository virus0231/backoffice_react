"use client";

import React from 'react';
import { computePercentageChange, formatPercentage, trendColor } from '@/lib/calculations/percentageChange';

interface PercentageChangeBadgeProps {
  current: number | null | undefined;
  comparison: number | null | undefined;
  className?: string;
}

export default function PercentageChangeBadge({ current, comparison, className }: PercentageChangeBadgeProps) {
  const result = computePercentageChange(current, comparison);
  const label = formatPercentage(result, { decimals: 1, includeSign: true });

  const arrow = result.direction === 'up' ? (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3l5 6h-3v8H8v-8H5l5-6z" /></svg>
  ) : result.direction === 'down' ? (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 17l-5-6h3V3h4v8h3l-5 6z" /></svg>
  ) : (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 10h12v2H4z" /></svg>
  );

  const color = trendColor(result.direction);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 ${color} ${className || ''}`.trim()}>
      {arrow}
      <span>{label}</span>
    </span>
  );
}

