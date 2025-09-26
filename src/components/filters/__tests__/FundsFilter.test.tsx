import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FundsFilter } from '../FundsFilter';
import { useFilterStore } from '@/stores/filterStore';

// Mock the filter store
jest.mock('@/stores/filterStore');
const mockUseFilterStore = useFilterStore as jest.MockedFunction<typeof useFilterStore>;

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('FundsFilter', () => {
  const mockSetSelectedFund = jest.fn();
  const mockClearSelectedFund = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default store state
    mockUseFilterStore.mockReturnValue({
      selectedAppeal: null,
      selectedFund: null,
      setSelectedFund: mockSetSelectedFund,
      clearSelectedFund: mockClearSelectedFund,
      // Add other required store properties with default values
      dateRange: { start: new Date(), end: new Date(), preset: 'last-30-days' },
      frequency: 'all',
      comparisonEnabled: false,
      lastValidationError: null,
      setDateRange: jest.fn(),
      setFrequency: jest.fn(),
      setComparisonEnabled: jest.fn(),
      clearAllFilters: jest.fn(),
      useFilterParams: jest.fn(() => ({})),
      useHasActiveFilters: jest.fn(() => false)
    });

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: 1, name: 'General Fund', description: 'General donations' },
          { id: 2, name: 'Emergency Fund', description: 'Emergency relief' }
        ]
      })
    } as Response);
  });

  describe('Initial Rendering', () => {
    it('should render with default "All Funds" option when no appeal selected', async () => {
      render(<FundsFilter />);

      const button = screen.getByRole('button', { name: /all funds/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('All Funds');
    });

    it('should show loading state when appeal is selected but funds are loading', async () => {
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading funds...');
      expect(button).toBeDisabled();
    });
  });

  describe('Cascading Logic', () => {
    it('should clear fund selection when appeal changes', async () => {
      const user = userEvent.setup();

      // Start with an appeal and fund selected
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' },
        selectedFund: { id: 1, name: 'General Fund' }
      });

      const { rerender } = render(<FundsFilter />);

      // Change appeal selection
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 2, name: 'Emergency Campaign' },
        selectedFund: null // Fund should be cleared
      });

      rerender(<FundsFilter />);

      // Wait for the cascading logic to trigger
      await waitFor(() => {
        expect(mockClearSelectedFund).toHaveBeenCalled();
      });
    });

    it('should fetch funds when appeal is selected', async () => {
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/filters/funds?appeal_id=1');
      });
    });

    it('should reset to "All Funds" when appeal is deselected', async () => {
      // Start with appeal selected
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      const { rerender } = render(<FundsFilter />);

      // Deselect appeal
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: null
      });

      rerender(<FundsFilter />);

      const button = screen.getByRole('button', { name: /all funds/i });
      expect(button).toHaveTextContent('All Funds');
    });
  });

  describe('Fund Selection', () => {
    beforeEach(async () => {
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });
    });

    it('should display fund options when dropdown is opened', async () => {
      const user = userEvent.setup();

      render(<FundsFilter />);

      // Wait for funds to load
      await waitFor(() => {
        expect(screen.queryByText('Loading funds...')).not.toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('All Funds')).toBeInTheDocument();
      expect(screen.getByText('General Fund')).toBeInTheDocument();
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });

    it('should update store when fund is selected', async () => {
      const user = userEvent.setup();

      render(<FundsFilter />);

      await waitFor(() => {
        expect(screen.queryByText('Loading funds...')).not.toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      const fundOption = screen.getByText('General Fund');
      await user.click(fundOption);

      expect(mockSetSelectedFund).toHaveBeenCalledWith({
        id: 1,
        name: 'General Fund',
        description: 'General donations'
      });
    });

    it('should clear fund selection when "All Funds" is selected', async () => {
      const user = userEvent.setup();

      // Start with a fund selected
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' },
        selectedFund: { id: 1, name: 'General Fund' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        expect(screen.queryByText('Loading funds...')).not.toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      const allFundsOption = screen.getByText('All Funds');
      await user.click(allFundsOption);

      expect(mockClearSelectedFund).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Error loading funds');
        expect(button).toBeDisabled();
      });
    });

    it('should handle API response errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'INTERNAL_ERROR'
        })
      } as Response);

      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Error loading funds');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<FundsFilter />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should update ARIA attributes when dropdown is opened', async () => {
      const user = userEvent.setup();

      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        expect(screen.queryByText('Loading funds...')).not.toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Loading States', () => {
    it('should show spinner during fund loading', async () => {
      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      // Should show loading state initially
      expect(screen.getByText('Loading funds...')).toBeInTheDocument();
    });

    it('should handle empty fund list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      } as Response);

      mockUseFilterStore.mockReturnValue({
        ...mockUseFilterStore(),
        selectedAppeal: { id: 1, name: 'Annual Campaign' }
      });

      render(<FundsFilter />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('No funds available');
        expect(button).toBeDisabled();
      });
    });
  });
});