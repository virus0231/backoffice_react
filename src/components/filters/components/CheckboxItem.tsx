'use client';

import React from 'react';
import { clsx } from 'clsx';

interface CheckboxItemProps {
  id: string | number;
  isSelected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function CheckboxItem({
  id,
  isSelected,
  onToggle,
  children,
  className
}: CheckboxItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'w-full px-4 py-3 text-sm text-left transition-all duration-150',
        'flex items-center group hover:bg-gray-50',
        isSelected && 'bg-blue-50 text-blue-900 font-medium',
        className
      )}
    >
      {/* Checkbox */}
      <div className={clsx(
        "w-4 h-4 mr-3 flex-shrink-0 border-2 rounded transition-colors",
        isSelected
          ? "bg-blue-500 border-blue-500"
          : "border-gray-300 bg-white group-hover:border-gray-400"
      )}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {children}
    </button>
  );
}