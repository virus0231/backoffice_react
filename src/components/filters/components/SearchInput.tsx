'use client';

import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = ''
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 placeholder-gray-400 ${className}`}
      />
      <svg
        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-gray-600"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}