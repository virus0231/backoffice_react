'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  const defaultIcon = (
    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="px-4 py-8 text-center">
      {icon || defaultIcon}
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}