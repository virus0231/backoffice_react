/**
 * Filter type definitions for the universal filter system
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: DatePreset | null;
}

export type DatePreset =
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
  selectedAppeal: Appeal | null;
  selectedFund: Fund | null;
  frequency: FrequencyType;

  // Actions
  setDateRange: (range: DateRange) => void;
  setAppeal: (appeal: Appeal | null) => void;
  setFund: (fund: Fund | null) => void;
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