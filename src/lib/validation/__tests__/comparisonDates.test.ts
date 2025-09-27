import { validateComparisonRange, rangesOverlap, resolveRangeConflict } from '@/lib/validation/comparisonDates';

const dr = (s: string, e: string) => ({ startDate: new Date(s), endDate: new Date(e), preset: 'custom' as const });

describe('comparisonDates validation', () => {
  const main = dr('2024-01-10', '2024-01-20');

  it('detects overlap correctly', () => {
    const overlapping = dr('2024-01-15', '2024-01-25');
    expect(rangesOverlap(main, overlapping)).toBe(true);

    const separate = dr('2023-12-01', '2023-12-10');
    expect(rangesOverlap(main, separate)).toBe(false);
  });

  it('invalidates overlapping comparison range', () => {
    const overlapping = dr('2024-01-15', '2024-01-25');
    const res = validateComparisonRange(main, overlapping);
    expect(res.isValid).toBe(false);
    expect(res.error).toMatch(/overlap/i);
  });

  it('validates non-overlapping comparison range', () => {
    const separate = dr('2023-12-01', '2023-12-10');
    const res = validateComparisonRange(main, separate);
    expect(res.isValid).toBe(true);
  });

  it('resolves conflicts by shifting earlier', () => {
    const desired = dr('2024-01-18', '2024-01-22');
    const { adjusted, changed } = resolveRangeConflict(main, desired);
    expect(changed).toBe(true);
    // adjusted should no longer overlap main
    const check = validateComparisonRange(main, adjusted);
    expect(check.isValid).toBe(true);
  });
});

