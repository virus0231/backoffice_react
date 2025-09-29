"use client";

import React from 'react';

interface HeatmapGridProps {
  data: number[][]; // rows x cols
  rowLabels?: string[];
  colLabels?: string[];
  colorStops?: { value: number; color: string }[]; // ascending by value
  height?: number;
}

function getColor(value: number, stops: { value: number; color: string }[]) {
  if (stops.length === 0) return '#e5e7eb'; // default gray color
  let last = stops[0]!.color;
  for (const s of stops) {
    if (value <= s.value) return s.color;
    last = s.color;
  }
  return last;
}

export default function HeatmapGrid({
  data,
  rowLabels,
  colLabels,
  colorStops = [
    { value: 0, color: '#f3f4f6' }, // gray-100
    { value: 1, color: '#dcfce7' }, // green-100
    { value: 3, color: '#86efac' }, // green-300
    { value: 6, color: '#22c55e' }, // green-500
  ],
  height = 260,
}: HeatmapGridProps) {
  const rows = data.length;
  const cols = data[0]?.length || 0;
  return (
    <div className="w-full" style={{ height }}>
      <div className="w-full h-full grid" style={{ gridTemplateRows: `auto 1fr`, gridTemplateColumns: `auto 1fr` }}>
        {/* Top-left spacer */}
        <div />
        {/* Column labels */}
        <div className="overflow-hidden">
          {colLabels && (
            <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {colLabels.map((c, i) => (
                <div key={i} className="text-xs text-gray-500 text-center truncate px-1">{c}</div>
              ))}
            </div>
          )}
        </div>
        {/* Row labels */}
        <div className="overflow-hidden">
          {rowLabels && (
            <div className="grid" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {rowLabels.map((r, i) => (
                <div key={i} className="text-xs text-gray-500 flex items-center justify-end pr-2">{r}</div>
              ))}
            </div>
          )}
        </div>
        {/* Grid cells */}
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
          {data.flatMap((row, r) =>
            row.map((val, c) => (
              <div key={`${r}-${c}`} className="rounded-sm" style={{ backgroundColor: getColor(val, colorStops) }} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

