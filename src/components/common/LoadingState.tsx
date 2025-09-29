'use client';

import React from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullHeight?: boolean;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
  fullHeight = false
}: LoadingStateProps) {
  const containerClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const spinnerSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200',
        containerClasses[size],
        fullHeight && 'min-h-[200px]',
        className
      )}
    >
      <LoadingSpinner size={spinnerSizes[size]} className="mb-3" />
      <p className="text-gray-600 text-sm text-center">{message}</p>
    </div>
  );
}

// Chart-specific loading state
export function ChartLoadingState({ title }: { title?: string }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 text-sm">
          {title ? `Loading ${title}...` : 'Loading chart...'}
        </p>
      </div>
    </div>
  );
}