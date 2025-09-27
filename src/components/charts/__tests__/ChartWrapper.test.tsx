import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ChartWrapper from '@/components/charts/ChartWrapper';

describe('ChartWrapper', () => {
  it('renders comparison controls when enabled', () => {
    render(
      <ChartWrapper chartId="cw-1" title="Test Chart">
        <div>child</div>
      </ChartWrapper>
    );

    expect(screen.getByText(/test chart/i)).toBeInTheDocument();
    // Has toggle checkbox
    const checkbox = screen.getByRole('checkbox', { name: /enable comparison/i });
    expect(checkbox).toBeInTheDocument();
    // Toggle on
    fireEvent.click(checkbox);
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });
});

