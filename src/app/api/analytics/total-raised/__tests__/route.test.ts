/** @jest-environment node */
import { GET } from '../route';

describe('/api/analytics/total-raised', () => {
  const mkUrl = (q: Record<string, string>) => {
    const u = new URL('http://localhost/api/analytics/total-raised');
    Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  };

  const iso = (d: Date) => d.toISOString();

  it('returns current period data with trend', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 5 * 86400000);
    const req = new Request(mkUrl({ startDate: iso(start), endDate: iso(now), granularity: 'daily' }));
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.currentPeriod.totalAmount).toEqual(expect.any(Number));
    expect(json.data.currentPeriod.donationCount).toEqual(expect.any(Number));
    expect(Array.isArray(json.data.trendData)).toBe(true);
    expect(json.meta.granularity).toBe('daily');
    // NFR headers
    expect(res.headers.get('Server-Timing')).toBeTruthy();
    expect(res.headers.get('X-Response-Time-ms')).toBeTruthy();
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=150');
  });

  it('supports comparison period', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 5 * 86400000);
    const prevEnd = new Date(start.getTime() - 86400000);
    const prevStart = new Date(prevEnd.getTime() - 5 * 86400000);
    const req = new Request(mkUrl({
      startDate: iso(start), endDate: iso(now), granularity: 'daily',
      compareStartDate: iso(prevStart), compareEndDate: iso(prevEnd)
    }));
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.comparisonPeriod).toBeDefined();
  });
});
