/** @jest-environment node */
import { GET } from '../route';

describe('/api/analytics/one-time-donations', () => {
  const mkUrl = (q: Record<string, string>) => {
    const u = new URL('http://localhost/api/analytics/one-time-donations');
    Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  };

  const iso = (d: Date) => d.toISOString();

  it('returns comparison when provided', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 86400000);
    const prevEnd = new Date(start.getTime() - 86400000);
    const prevStart = new Date(prevEnd.getTime() - 7 * 86400000);
    const req = new Request(mkUrl({
      startDate: iso(start), endDate: iso(now), granularity: 'weekly',
      compareStartDate: iso(prevStart), compareEndDate: iso(prevEnd)
    }));
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.comparisonPeriod).toBeDefined();
    expect(json.meta.granularity).toBe('weekly');
    expect(res.headers.get('Server-Timing')).toBeTruthy();
    expect(res.headers.get('X-Response-Time-ms')).toBeTruthy();
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=150');
  });
});
