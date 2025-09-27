"use client";

import React from 'react';
import type { Granularity } from '@/components/charts/configs/areaChartConfig';

interface ViewToggleProps {
  value: Granularity;
  onChange: (value: Granularity) => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm">
      <button
        type="button"
        className={`px-3 py-1.5 ${value === 'daily' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'} transition-colors`}
        onClick={() => onChange('daily')}
      >
        Daily
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 border-l border-gray-300 ${value === 'weekly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'} transition-colors`}
        onClick={() => onChange('weekly')}
      >
        Weekly
      </button>
    </div>
  );
}

