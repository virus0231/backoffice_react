'use client';

import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  if (status === 'active') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ${className}`}>
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
        Active
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ${className}`}>
      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></span>
      Inactive
    </span>
  );
}