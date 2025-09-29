'use client';

/**
 * FundsFilter component with cascading logic based on selected appeal
 * Dynamically loads available funds from the database
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

import { Fund, Appeal } from '@/types/filters';
import { buildFundsUrl } from '@/lib/config/phpApi';

interface FundsFilterProps {
  value: Fund[];
  onChange: (funds: Fund[]) => void;
  selectedAppeals: Appeal[];
  className?: string;
  disabled?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Fund[];
  count: number;
  filters: {
    appeal_id?: string;
    include_inactive: boolean;
  };
  message: string;
}

export default function FundsFilter({
  value,
  onChange,
  selectedAppeals,
  className,
  disabled = false
}: FundsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevSelectedAppealsRef = useRef<Appeal[]>([]);

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

  // Load funds from API based on selected appeals
  const loadFunds = async (appealIds?: number[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = buildFundsUrl(appealIds);
      const response = await fetch(url);
      if (!response.ok) {
        const message = `Unable to load funds (${response.status})`;
        setError(message);
        setFunds([]);
        return; // graceful exit without throwing
      }

      const result: ApiResponse = await response.json();
      if (result && result.success) {
        setFunds(result.data || []);
      } else {
        setError(result?.message || 'Failed to load funds');
        setFunds([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load funds';
      setError(errorMessage);
      // Silently handle to avoid noisy console errors in production
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current fund selections if appeals changed and funds are no longer valid
  useEffect(() => {
    const prevAppeals = prevSelectedAppealsRef.current;
    const appealsChanged = JSON.stringify(prevAppeals.map(a => a.id)) !== JSON.stringify(selectedAppeals.map(a => a.id));

    if (appealsChanged && selectedAppeals.length > 0 && value.length > 0) {
      const validFunds = value.filter(fund =>
        selectedAppeals.some(appeal => appeal.id === fund.appeal_id)
      );
      if (validFunds.length !== value.length) {
        onChange(validFunds);
      }
    }

    prevSelectedAppealsRef.current = selectedAppeals;
  }, [selectedAppeals, value, onChange]);

  // Load funds when appeals change or dropdown opens (only if appeals are selected)
  useEffect(() => {
    if (selectedAppeals.length > 0 && (isOpen || funds.length === 0)) {
      const appealIds = selectedAppeals.map(appeal => appeal.id);
      loadFunds(appealIds);
    } else if (selectedAppeals.length === 0) {
      // Clear funds when no appeals are selected
      setFunds([]);
      setError(null);
    }
  }, [selectedAppeals, isOpen, funds.length]);

  // Filter funds based on search term
  const filteredFunds = funds.filter(fund =>
    fund.fund_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fund.category && fund.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group funds by category
  const groupedFunds = filteredFunds.reduce((groups, fund) => {
    const category = fund.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(fund);
    return groups;
  }, {} as Record<string, Fund[]>);

  const handleFundSelect = (fund: Fund | null) => {
    if (fund === null) {
      // "All Funds" selected - clear all selections
      onChange([]);
      setIsOpen(false);
      setSearchTerm('');
    } else {
      // Toggle fund in the selection
      const isSelected = value.some(selected => selected.id === fund.id);
      if (isSelected) {
        // Remove from selection
        onChange(value.filter(selected => selected.id !== fund.id));
      } else {
        // Add to selection
        onChange([...value, fund]);
      }
      // Don't close dropdown for multiselect
    }
  };

  const isFundSelected = (fund: Fund): boolean => {
    return value.some(selected => selected.id === fund.id);
  };

  const getAppealName = (appealId?: number): string | null => {
    if (!appealId) return null;
    const appeal = selectedAppeals.find(appeal => appeal.id === appealId);
    return appeal ? appeal.appeal_name : null;
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (value.length > 0) {
      return value.length === 1
        ? value[0]?.fund_name
        : 'Funds Selected';
    }
    return 'Funds';
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Funds Display Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-between min-w-48 px-4 py-2.5 text-sm',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-all duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <div className="flex items-center min-w-0">
          {value.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              {value.length}
            </span>
          )}
          <span className="text-gray-700 truncate">
            {value.length > 0
              ? value.length === 1
                ? value[0]?.fund_name
                : 'Funds Selected'
              : 'Funds'
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
                placeholder="Search funds..."
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

          {/* Appeals Context */}
          {selectedAppeals.length > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center text-sm text-blue-700">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Showing funds for:{' '}
                  {selectedAppeals.length === 1 ? (
                    <span className="font-medium">{selectedAppeals[0]?.appeal_name}</span>
                  ) : (
                    <span className="font-medium">{selectedAppeals.length} selected appeals</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-sm text-gray-600">Loading funds...</span>
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
                onClick={() => {
                  const appealIds = selectedAppeals.map(appeal => appeal.id);
                  loadFunds(appealIds);
                }}
                className="mt-2 text-red-800 underline hover:text-red-900 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Funds List */}
          {!isLoading && !error && (
            <div className="max-h-64 overflow-y-auto">
              {/* All Funds Option */}
              <button
                type="button"
                onClick={() => handleFundSelect(null)}
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
                  {selectedAppeals.length > 0
                    ? selectedAppeals.length === 1
                      ? `All Funds (${selectedAppeals[0]?.appeal_name})`
                      : `All Funds (${selectedAppeals.length} Appeals)`
                    : 'All Funds'
                  }
                </div>
              </button>

              {/* Grouped Funds */}
              {Object.keys(groupedFunds).length > 0 ? (
                Object.entries(groupedFunds).map(([category, categoryFunds]) => (
                  <div key={category} className="mt-2">
                    {Object.keys(groupedFunds).length > 1 && (
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {category}
                      </div>
                    )}
                    {categoryFunds.map((fund) => (
                      <button
                        key={fund.id}
                        type="button"
                        onClick={() => handleFundSelect(fund)}
                        className={clsx(
                          'w-full px-4 py-3 text-sm text-left transition-all duration-150',
                          'flex items-center justify-between group hover:bg-gray-50',
                          isFundSelected(fund) && 'bg-blue-50 text-blue-900 font-medium'
                        )}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          {/* Checkbox */}
                          <div className={clsx(
                            "w-4 h-4 mr-3 flex-shrink-0 border-2 rounded transition-colors",
                            isFundSelected(fund)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 bg-white group-hover:border-gray-400"
                          )}>
                            {isFundSelected(fund) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="truncate font-medium block">{fund.fund_name}</span>
                            {selectedAppeals.length > 1 && getAppealName(fund.appeal_id) && (
                              <span className="text-xs text-gray-500 truncate block">
                                {getAppealName(fund.appeal_id)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center ml-3 space-x-2 flex-shrink-0">
                          {fund.is_active ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></span>
                              Inactive
                            </span>
                          )}
                        </div>
                        </button>
                      ))}
                    </div>
                  ))
              ) : searchTerm && !isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No funds found matching "{searchTerm}"
                </div>
              ) : null}

              {/* No Appeals Selected */}
              {selectedAppeals.length === 0 && !isLoading && !error && (
                <div className="px-4 py-8 text-center">
                  <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500 mb-1">Select appeals first</p>
                  <p className="text-xs text-gray-400">Choose one or more appeals to see available funds</p>
                </div>
              )}

              {/* No Funds Available */}
              {selectedAppeals.length > 0 && funds.length === 0 && !isLoading && !error && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {selectedAppeals.length === 1
                    ? `No funds available for ${selectedAppeals[0]?.appeal_name}`
                    : `No funds available for selected appeals`
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
