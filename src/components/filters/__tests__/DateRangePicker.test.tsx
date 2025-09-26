/**
 * Tests for DateRangePicker component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangePicker from '../DateRangePicker';
import { DateRange } from '@/types/filters';
import { getDefaultDateRange } from '@/lib/utils/dateHelpers';

describe('DateRangePicker', () => {
  const defaultDateRange = getDefaultDateRange();
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with default props', () => {
    render(
      <DateRangePicker
        value={defaultDateRange}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        value={defaultDateRange}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Quick Select')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('should handle preset selection', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        value={defaultDateRange}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Click Today preset
    const todayButton = screen.getByText('Today');
    await user.click(todayButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'today'
      })
    );
  });

  it('should handle custom date range', async () => {
    const user = userEvent.setup();
    const customRange: DateRange = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      preset: 'custom'
    };

    render(
      <DateRangePicker
        value={customRange}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Should show custom date inputs
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByText('Apply Range')).toBeInTheDocument();
  });

  it('should validate custom date ranges', async () => {
    const user = userEvent.setup();
    const customRange: DateRange = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      preset: 'custom'
    };

    render(
      <DateRangePicker
        value={customRange}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Set invalid date range (start after end)
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.clear(startDateInput);
    await user.type(startDateInput, '2023-01-31');
    await user.clear(endDateInput);
    await user.type(endDateInput, '2023-01-01');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/start date cannot be after end date/i)).toBeInTheDocument();
    });
  });

  it('should handle disabled state', () => {
    render(
      <DateRangePicker
        value={defaultDateRange}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <DateRangePicker
          value={defaultDateRange}
          onChange={mockOnChange}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Quick Select')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Quick Select')).not.toBeInTheDocument();
    });
  });

  it('should display formatted date range', () => {
    const customRange: DateRange = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      preset: 'custom'
    };

    render(
      <DateRangePicker
        value={customRange}
        onChange={mockOnChange}
      />
    );

    // Should display formatted custom range
    expect(screen.getByText(/Jan 1, 2023 - Jan 31, 2023/)).toBeInTheDocument();
  });

  it('should apply custom class names', () => {
    const { container } = render(
      <DateRangePicker
        value={defaultDateRange}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should prevent future dates in custom range', async () => {
    const user = userEvent.setup();
    const customRange: DateRange = {
      startDate: new Date(),
      endDate: new Date(),
      preset: 'custom'
    };

    render(
      <DateRangePicker
        value={customRange}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

    // Should have max attribute set to today's date
    const today = new Date().toISOString().split('T')[0];
    expect(endDateInput.max).toBe(today);
  });
});