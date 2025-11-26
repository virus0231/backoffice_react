/**
 * Filter type definitions for the universal filter system
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: DatePreset | null;
}

export type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last14days'
  | 'last30days'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisYear'
  | 'lastWeek'
  | 'lastMonth'
  | 'lastYear'
  | 'custom';

export interface DatePresetOption {
  label: string;
  value: DatePreset;
  range: () => DateRange;
}

export interface Appeal {
  id: number;
  appeal_name: string;
  status: 'active' | 'inactive';
  start_date: Date | null;
  end_date: Date | null;
}

export interface Fund {
  id: number;
  fund_name: string;
  is_active: boolean;
  appeal_id?: number;
  // Optional categorization used by Filters UI grouping
  category?: string;
}

export type FrequencyType =
  | 'all'
  | 'one-time'
  | 'recurring'
  | 'recurring-first'
  | 'recurring-next';

export interface FrequencyOption {
  label: string;
  value: FrequencyType;
  description: string;
}

export interface FilterState {
  dateRange: DateRange;
  selectedAppeals: Appeal[]; // Array for multiselect
  selectedFunds: Fund[]; // Array for multiselect
  frequency: FrequencyType;

  // Actions
  setDateRange: (range: DateRange) => void;
  setAppeals: (appeals: Appeal[]) => void; // Handle array
  setFunds: (funds: Fund[]) => void; // Handle array
  setFrequency: (frequency: FrequencyType) => void;
  clearAllFilters: () => void;
  resetToDefaults: () => void;
}

export interface FilterValidationError {
  field: string;
  message: string;
}

export interface FilterValidationResult {
  isValid: boolean;
  errors: FilterValidationError[];
}
