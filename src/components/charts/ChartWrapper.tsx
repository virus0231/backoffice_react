"use client";

import React from 'react';
import { clsx } from 'clsx';

import ComparisonToggle from '@/components/charts/ComparisonToggle';
import ComparisonIndicator from '@/components/charts/ComparisonIndicator';

interface ChartWrapperProps {
  chartId: string;
  title?: string;
  enableComparison?: boolean;
  actionsSlot?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function ChartWrapper({
  chartId,
  title,
  enableComparison = true,
  actionsSlot,
  className,
  children
}: ChartWrapperProps) {
  return (
    <div className={clsx('chart-container', className)}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="flex items-center gap-3">
          {enableComparison && <ComparisonIndicator chartId={chartId} />}
          {actionsSlot}
        </div>
      </div>
      <div className="p-3">
        {enableComparison && (
          <div className="mb-3">
            <ComparisonToggle chartId={chartId} />
          </div>
        )}
        <div className="h-64">
          {children}
        </div>
      </div>
    </div>
  );
}

