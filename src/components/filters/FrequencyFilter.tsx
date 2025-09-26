'use client';

/**
 * FrequencyFilter component for donation frequency selection
 * Provides options for filtering by donation type patterns
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

import { FrequencyType, FrequencyOption } from '@/types/filters';

interface FrequencyFilterProps {
  value: FrequencyType;
  onChange: (frequency: FrequencyType) => void;
  className?: string;
  disabled?: boolean;
}

// Frequency options with descriptions
const frequencyOptions: FrequencyOption[] = [
  {
    label: 'All Donations',
    value: 'all',
    description: 'Show all donation types without filtering'
  },
  {
    label: 'One-time Donations',
    value: 'one-time',
    description: 'Single donations with no recurring schedule'
  },
  {
    label: 'Recurring Donations',
    value: 'recurring',
    description: 'All donations with recurring schedules'
  },
  {
    label: 'Recurring (First Installments)',
    value: 'recurring-first',
    description: 'Initial donations in recurring series'
  },
  {
    label: 'Recurring (Next Installments)',
    value: 'recurring-next',
    description: 'Follow-up donations in recurring series'
  }
];

export default function FrequencyFilter({
  value,
  onChange,
  className,
  disabled = false
}: FrequencyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = frequencyOptions.find(option => option.value === value);

  const handleFrequencySelect = (frequency: FrequencyType) => {
    onChange(frequency);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Frequency Display Button */}
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
            {selectedOption?.label || 'All Donations'}
          </span>
          {value !== 'all' && (
            <span className="ml-2 px-2 py-0.5 text-xs text-blue-700 bg-blue-100 rounded-full">
              Filtered
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
          <div className="py-2">
            {/* Frequency Options */}
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFrequencySelect(option.value)}
                className={clsx(
                  'w-full px-4 py-3 text-left transition-colors duration-150',
                  'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                  value === option.value && 'bg-blue-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={clsx(
                      'text-sm font-medium',
                      value === option.value ? 'text-blue-900' : 'text-gray-900'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                  {value === option.value && (
                    <svg
                      className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Frequency Information */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Filter Information:</div>
              <div className="space-y-1">
                <div>• <strong>One-time:</strong> freq = 0 in database</div>
                <div>• <strong>Recurring:</strong> freq &gt; 0 in database</div>
                <div>• <strong>First installments:</strong> freq = 1 without order_id pattern</div>
                <div>• <strong>Next installments:</strong> freq &gt; 1 or order_id pattern</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}