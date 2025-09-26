'use client';

/**
 * FundsFilter component with cascading logic based on selected appeal
 * Dynamically loads available funds from the database
 */

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

import { Fund, Appeal } from '@/types/filters';

interface FundsFilterProps {
  value: Fund | null;
  onChange: (fund: Fund | null) => void;
  selectedAppeal: Appeal | null;
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
  selectedAppeal,
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

  // Load funds from API based on selected appeal
  const loadFunds = async (appealId?: number | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/filters/funds', window.location.origin);
      if (appealId) {
        url.searchParams.set('appeal_id', appealId.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      if (result.success) {
        setFunds(result.data);
      } else {
        throw new Error('Failed to load funds');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load funds';
      setError(errorMessage);
      console.error('Error loading funds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload funds when selected appeal changes (cascading logic)
  useEffect(() => {
    // Clear current fund selection if appeal changed and fund is no longer valid
    if (selectedAppeal && value && value.appeal_id && value.appeal_id !== selectedAppeal.id) {
      onChange(null);
    }

    // Load new funds for the selected appeal
    if (isOpen || funds.length === 0) {
      loadFunds(selectedAppeal?.id);
    }
  }, [selectedAppeal, isOpen, funds.length, value, onChange]);

  // Load funds when dropdown opens
  useEffect(() => {
    if (isOpen && !isLoading) {
      loadFunds(selectedAppeal?.id);
    }
  }, [isOpen, isLoading, selectedAppeal?.id]);

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
    onChange(fund);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (value) {
      return value.category ? `${value.category} - ${value.fund_name}` : value.fund_name;
    }
    return selectedAppeal ? `All Funds (${selectedAppeal.appeal_name})` : 'All Funds';
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
          'flex items-center justify-between w-full px-4 py-2.5 text-sm',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          'transition-colors duration-200',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
        )}
      >
        <div className="flex items-center">
          <span className="text-gray-900 truncate">
            {getDisplayText()}
          </span>
          {!value?.is_active && value && (
            <span className="ml-2 px-2 py-0.5 text-xs text-orange-700 bg-orange-100 rounded-full">
              Inactive
            </span>
          )}
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
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-3">
            {/* Search Input */}
            <div className="mb-3">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search funds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Appeal Context */}
            {selectedAppeal && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-700">
                  Showing funds for: <span className="font-medium">{selectedAppeal.appeal_name}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading funds...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
                <button
                  type="button"
                  onClick={() => loadFunds(selectedAppeal?.id)}
                  className="ml-2 text-red-700 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Funds List */}
            {!isLoading && !error && (
              <div className="max-h-60 overflow-y-auto">
                {/* All Funds Option */}
                <button
                  type="button"
                  onClick={() => handleFundSelect(null)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm text-left rounded-md transition-colors duration-150',
                    !value
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {selectedAppeal ? `All Funds (${selectedAppeal.appeal_name})` : 'All Funds'}
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
                            'w-full px-3 py-2 text-sm text-left rounded-md transition-colors duration-150',
                            'flex items-center justify-between',
                            value?.id === fund.id
                              ? 'bg-blue-100 text-blue-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <span className="truncate">{fund.fund_name}</span>
                          <div className="flex items-center ml-2 space-x-1">
                            {!fund.is_active && (
                              <span className="px-1.5 py-0.5 text-xs text-orange-700 bg-orange-100 rounded">
                                Inactive
                              </span>
                            )}
                            {fund.is_active && (
                              <span className="px-1.5 py-0.5 text-xs text-green-700 bg-green-100 rounded">
                                Active
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

                {/* No Funds Available */}
                {funds.length === 0 && !isLoading && !error && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    {selectedAppeal
                      ? `No funds available for ${selectedAppeal.appeal_name}`
                      : 'No funds available'
                    }
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