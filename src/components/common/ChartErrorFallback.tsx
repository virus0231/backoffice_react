'use client';

import React from 'react';

interface ChartErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
}

export default function ChartErrorFallback({
  error,
  resetError,
  title = "Chart Error"
}: ChartErrorFallbackProps) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center p-6">
        <div className="w-12 h-12 mx-auto mb-4 text-red-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Unable to load chart data. Please try again.
        </p>
        {resetError && (
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}