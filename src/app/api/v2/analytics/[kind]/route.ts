import { NextResponse } from 'next/server';
import { aggregateRevenue, revenueTrend, Granularity } from '@/lib/services/analytics/revenue';

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Unified v2 response: data = { totalAmount, totalCount, trendData: [{ period, amount, count }] }
export async function GET(request: Request, ctx: { params: Promise<{ kind: string }> }) {
  const t0 = (globalThis.performance || { now: () => Date.now() }).now();
  const url = new URL(request.url);
  const { kind } = await ctx.params;
  const safeKind = (kind as 'total-raised' | 'first-installments' | 'one-time');

  const startDate = parseDate(url.searchParams.get('startDate'));
  const endDate = parseDate(url.searchParams.get('endDate'));
  const granularity = (url.searchParams.get('granularity') as Granularity) || 'daily';
  const appealId = url.searchParams.get('appealId');
  const fundId = url.searchParams.get('fundId');
  const frequency = (url.searchParams.get('frequency') as any) || 'all';

  if (!startDate || !endDate) {
    return NextResponse.json({ success: false, error: 'Missing startDate/endDate' }, { status: 400 });
  }

  const params = {
    startDate,
    endDate,
    appealId: appealId ?? null,
    fundId: fundId ?? null,
    frequency,
  } as const;

  const [agg, trend] = await Promise.all([
    aggregateRevenue(params as any, safeKind),
    revenueTrend(params as any, safeKind, granularity),
  ]);

  const data = {
    totalAmount: agg.totalAmount,
    totalCount: agg.donationCount,
    trendData: trend.map(p => ({ period: p.date, amount: p.amount, count: p.count })),
  };

  const res = NextResponse.json({
    success: true,
    data,
    meta: {
      endpoint: 'v2/analytics',
      kind: safeKind,
      granularity,
      filters: { appealId: appealId ?? null, fundId: fundId ?? null, frequency },
      lastUpdated: new Date().toISOString(),
    },
  });
  const t1 = (globalThis.performance || { now: () => Date.now() }).now();
  const dur = Math.max(0, Math.round(t1 - t0));
  res.headers.set('Server-Timing', `app;dur=${dur}`);
  res.headers.set('X-Response-Time-ms', String(dur));
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=150');
  return res;
}
