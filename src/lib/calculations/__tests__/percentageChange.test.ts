import { computePercentageChange, formatPercentage } from '@/lib/calculations/percentageChange';

describe('percentageChange', () => {
  it('computes positive change correctly', () => {
    const res = computePercentageChange(120, 100);
    expect(res.value).toBeCloseTo(20);
    expect(res.direction).toBe('up');
    expect(formatPercentage(res)).toBe('+20%');
  });

  it('computes negative change correctly', () => {
    const res = computePercentageChange(80, 100);
    expect(res.value).toBeCloseTo(-20);
    expect(res.direction).toBe('down');
  });

  it('handles zero baseline', () => {
    const resInf = computePercentageChange(50, 0);
    expect(resInf.isInfinite).toBe(true);

    const resZero = computePercentageChange(0, 0);
    expect(resZero.value).toBe(0);
    expect(resZero.isInfinite).toBe(false);
  });

  it('handles null values', () => {
    const res = computePercentageChange(null, 100);
    expect(res.value).toBeNull();
  });
});

