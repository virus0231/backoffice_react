'use client';

/**
 * AppealsFilter component for selecting fundraising appeals/campaigns
 * Dynamically loads available appeals from the database
 */

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

import { Appeal } from '@/types/filters';
import { buildAppealsUrl } from '@/lib/config/phpApi';
import { safeFetch, parseAPIResponse, logError, formatErrorForDisplay } from '@/lib/utils/errorHandling';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { cachedFetch } from '@/lib/cache/apiCache';

interface AppealsFilterProps {
  value: Appeal[];
  onChange: (appeals: Appeal[]) => void;
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
      // Use cached fetch with 10-minute TTL for appeals (relatively static data)
      const result: ApiResponse = await cachedFetch(buildAppealsUrl(), {}, {
        ttl: 10 * 60 * 1000, // 10 minutes
        useLocalStorage: true,
        dedupe: true
      });

      if (result.success) {
        setAppeals(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load appeals');
      }
    } catch (err) {
      logError(err, 'Error loading appeals');
      const { message } = formatErrorForDisplay(err);
      setError(message);
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
    if (appeal === null) {
      // "All Appeals" selected - clear all selections
      onChange([]);
      setIsOpen(false);
      setSearchTerm('');
    } else {
      // Toggle appeal in the selection
      const isSelected = value.some(selected => selected.id === appeal.id);
      if (isSelected) {
        // Remove from selection
        onChange(value.filter(selected => selected.id !== appeal.id));
      } else {
        // Add to selection
        onChange([...value, appeal]);
      }
      // Don't close dropdown for multiselect
    }
  };

  const isAppealSelected = (appeal: Appeal): boolean => {
    return value.some(selected => selected.id === appeal.id);
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
          'transition-all duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          className
        )}
      >
        <div className="flex items-center min-w-0">
          {value.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              {value.length}
            </span>
          )}
          <span className="text-gray-700 truncate">
            {value.length > 0
              ? value.length === 1
                ? value[0]?.appeal_name
                : 'Appeals Selected'
              : 'Appeals'
            }
          </span>
        </div>
        <svg
          className={clsx(
            'w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2',
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
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{ minWidth: '320px' }}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search appeals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 placeholder-gray-400"
              />
              <svg
                className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-gray-600"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-sm text-gray-600">Loading appeals...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 m-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
              <button
                type="button"
                onClick={loadAppeals}
                className="mt-2 text-red-800 underline hover:text-red-900 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Appeals List */}
          {!isLoading && !error && (
            <div className="max-h-64 overflow-y-auto">
              {/* All Appeals Option */}
              <button
                type="button"
                onClick={() => handleAppealSelect(null)}
                className={clsx(
                  'w-full px-4 py-3 text-sm text-left transition-all duration-150',
                  'flex items-center group hover:bg-gray-50',
                  value.length === 0 && 'bg-blue-50 text-blue-900 font-medium'
                )}
              >
                {/* Checkbox */}
                <div className={clsx(
                  "w-4 h-4 mr-3 flex-shrink-0 border-2 rounded",
                  value.length === 0
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 bg-white"
                )}>
                  {value.length === 0 && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Appeals
                </div>
              </button>

              {/* Filtered Appeals */}
              {filteredAppeals.length > 0 ? (
                filteredAppeals.map((appeal) => (
                  <button
                    key={appeal.id}
                    type="button"
                    onClick={() => handleAppealSelect(appeal)}
                    className={clsx(
                      'w-full px-4 py-3 text-sm text-left transition-all duration-150',
                      'flex items-center justify-between group hover:bg-gray-50',
                      isAppealSelected(appeal) && 'bg-blue-50 text-blue-900 font-medium'
                    )}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      {/* Checkbox */}
                      <div className={clsx(
                        "w-4 h-4 mr-3 flex-shrink-0 border-2 rounded transition-colors",
                        isAppealSelected(appeal)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 bg-white group-hover:border-gray-400"
                      )}>
                        {isAppealSelected(appeal) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="truncate font-medium">{appeal.appeal_name}</span>
                    </div>
                    <div className="flex items-center ml-3 space-x-2 flex-shrink-0">
                      {appeal.status === 'active' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                          Active
                        </span>
                      )}
                      {appeal.status === 'inactive' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></span>
                          Inactive
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : searchTerm && !isLoading ? (
                <div className="px-4 py-8 text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">No appeals found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                </div>
              ) : null}

              {/* No Appeals Available */}
              {appeals.length === 0 && !isLoading && !error && (
                <div className="px-4 py-8 text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">No appeals available</p>
                  <p className="text-xs text-gray-400 mt-1">Appeals will appear here when added</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
