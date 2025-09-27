import { GET } from '@/app/api/analytics/series/route';

function makeUrl(params: Record<string, string | number | null | undefined>) {
  const url = new URL('http://localhost/api/analytics/series');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

describe('analytics/series comparison integration', () => {
  it('returns current series only when no comparison', async () => {
    const res = await GET(new Request(makeUrl({ startDate: '2024-05-01', endDate: '2024-05-05' })));
    const json = await (res as any).json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.current)).toBe(true);
    expect(json.comparison).toBeNull();
  });

  it('returns both current and comparison when provided', async () => {
    const res = await GET(new Request(makeUrl({
      startDate: '2024-05-01', endDate: '2024-05-05',
      compareStartDate: '2024-04-26', compareEndDate: '2024-04-30'
    })));
    const json = await (res as any).json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.current)).toBe(true);
    expect(Array.isArray(json.comparison)).toBe(true);
    expect(json.current.length).toBe(5);
    expect(json.comparison.length).toBe(5);
  });
});

