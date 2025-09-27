import { overlayByIndex, overlayByDate } from '@/lib/utils/comparisonOverlay';

describe('comparisonOverlay utils', () => {
  it('overlays by index', () => {
    const current = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
    ];
    const comparison = [
      { date: '2023-12-01', value: 8 },
      { date: '2023-12-02', value: 18 },
    ];
    const out = overlayByIndex(current, comparison);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ date: '2024-01-01', current: 10, comparison: 8 });
  });

  it('overlays by date key', () => {
    const current = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 20 },
    ];
    const comparison = [
      { date: '2024-01-02', value: 18 },
      { date: '2024-01-03', value: 25 },
    ];
    const out = overlayByDate(current, comparison);
    expect(out.map(p => p.date)).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ]);
    expect(out[1].current).toBe(20);
    expect(out[1].comparison).toBe(18);
  });
});

