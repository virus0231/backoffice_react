'use client';

/**
 * AppealsFilter component for selecting fundraising appeals/campaigns
 * Dynamically loads available appeals from the database
 */

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

import { Appeal } from '@/types/filters';

interface AppealsFilterProps {
  value: Appeal | null;
  onChange: (appeal: Appeal | null) => void;
  className?: string;
  disabled?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Appeal[];
  count: number;
  message: string;
}

export default function AppealsFilter({
  value,
  onChange,
  className,
  disabled = false
}: AppealsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load appeals from API
  const loadAppeals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/filters/appeals');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      if (result.success) {
        setAppeals(result.data);
      } else {
        throw new Error('Failed to load appeals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appeals';
      setError(errorMessage);
      console.error('Error loading appeals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load appeals when component mounts or dropdown opens
  useEffect(() => {
    if (isOpen && appeals.length === 0 && !isLoading) {
      loadAppeals();
    }
  }, [isOpen, appeals.length, isLoading]);

  // Filter appeals based on search term
  const filteredAppeals = appeals.filter(appeal =>
    appeal.appeal_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppealSelect = (appeal: Appeal | null) => {
    onChange(appeal);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Appeals Display Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2.5 text-sm',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-colors duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <div className="flex items-center">
          <span className="text-gray-900">
            {value ? value.appeal_name : 'All Appeals'}
          </span>
          {value?.status === 'inactive' && (
            <span className="ml-2 px-2 py-0.5 text-xs text-orange-700 bg-orange-100 rounded-full">
              Inactive
            </span>
          )}
        </div>
        <svg
          className={clsx(
            'w-4 h-4 text-gray-500 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-3">
            {/* Search Input */}
            <div className="mb-3">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search appeals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading appeals...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
                <button
                  type="button"
                  onClick={loadAppeals}
                  className="ml-2 text-red-700 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Appeals List */}
            {!isLoading && !error && (
              <div className="max-h-60 overflow-y-auto">
                {/* All Appeals Option */}
                <button
                  type="button"
                  onClick={() => handleAppealSelect(null)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm text-left rounded-md transition-colors duration-150',
                    !value
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  All Appeals
                </button>

                {/* Filtered Appeals */}
                {filteredAppeals.length > 0 ? (
                  filteredAppeals.map((appeal) => (
                    <button
                      key={appeal.id}
                      type="button"
                      onClick={() => handleAppealSelect(appeal)}
                      className={clsx(
                        'w-full px-3 py-2 text-sm text-left rounded-md transition-colors duration-150',
                        'flex items-center justify-between',
                        value?.id === appeal.id
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className="truncate">{appeal.appeal_name}</span>
                      <div className="flex items-center ml-2 space-x-1">
                        {appeal.status === 'inactive' && (
                          <span className="px-1.5 py-0.5 text-xs text-orange-700 bg-orange-100 rounded">
                            Inactive
                          </span>
                        )}
                        {appeal.status === 'active' && (
                          <span className="px-1.5 py-0.5 text-xs text-green-700 bg-green-100 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : searchTerm && !isLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No appeals found matching "{searchTerm}"
                  </div>
                ) : null}

                {/* No Appeals Available */}
                {appeals.length === 0 && !isLoading && !error && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No appeals available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}