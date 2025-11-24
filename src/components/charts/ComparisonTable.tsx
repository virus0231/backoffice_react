"use client";

import React from 'react';
import type { OverlayPoint } from '@/lib/utils/comparisonOverlay';

interface Props {
  data: OverlayPoint[];
  className?: string;
}

export default function ComparisonTable({ data, className }: Props) {
  return (
    <div className={className}>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left p-2 border">Date</th>
            <th className="text-right p-2 border">Current</th>
            <th className="text-right p-2 border">Comparison</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="p-2 border">{String(row.date).slice(0, 10)}</td>
              <td className="p-2 border text-right">{row.current ?? '—'}</td>
              <td className="p-2 border text-right">{row.comparison ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

