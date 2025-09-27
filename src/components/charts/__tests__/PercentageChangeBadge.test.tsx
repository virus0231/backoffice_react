import React from 'react';
import { render, screen } from '@testing-library/react';
import PercentageChangeBadge from '@/components/charts/PercentageChangeBadge';

describe('PercentageChangeBadge', () => {
  it('renders up arrow and positive percentage', () => {
    render(<PercentageChangeBadge current={120} comparison={100} />);
    expect(screen.getByText('+20%')).toBeInTheDocument();
  });

  it('renders down arrow and negative percentage', () => {
    render(<PercentageChangeBadge current={80} comparison={100} />);
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('renders neutral when same', () => {
    render(<PercentageChangeBadge current={100} comparison={100} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

