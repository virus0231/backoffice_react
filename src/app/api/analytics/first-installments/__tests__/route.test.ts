/** @jest-environment node */
import { GET } from '../route';

describe('/api/analytics/first-installments', () => {
  const mkUrl = (q: Record<string, string>) => {
    const u = new URL('http://localhost/api/analytics/first-installments');
    Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  };

  const iso = (d: Date) => d.toISOString();

  it('returns current period with filters metadata', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 86400000);
    const req = new Request(mkUrl({ startDate: iso(start), endDate: iso(now), appealId: '123', fundId: '7', frequency: 'recurring' }));
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.filters).toEqual({ appealId: 123, fundId: 7, frequency: 'recurring' });
    expect(Array.isArray(json.data.trendData)).toBe(true);
    expect(res.headers.get('Server-Timing')).toBeTruthy();
    expect(res.headers.get('X-Response-Time-ms')).toBeTruthy();
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=150');
  });
});
