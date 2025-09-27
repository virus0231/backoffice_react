import { NextResponse } from 'next/server';
import { aggregateRevenue, revenueTrend } from '@/lib/services/analytics/revenue';

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Synthetic fallback for environments without DB
function generateSynthetic(start: Date, end: Date, granularity: 'daily' | 'weekly') {
  const daysBetween = (a: Date, b: Date) => Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000) + 1);
  const step = granularity === 'weekly' ? 7 : 1;
  const totalDays = daysBetween(start, end);
  const out = [] as { date: string; amount: number; count: number }[];
  for (let i = 0; i < totalDays; i += step) {
    const d = new Date(start.getTime() + i * 86400000);
    const base = Math.round(1000 + 200 * Math.sin(i / 2));
    out.push({ date: d.toISOString().slice(0, 10), amount: base, count: Math.round(base / 25) });
  }
  return out;
}

export async function GET(request: Request) {
  const t0 = (globalThis.performance || { now: () => Date.now() }).now();
  const url = new URL(request.url);
  const startDate = parseDate(url.searchParams.get('startDate'));
  const endDate = parseDate(url.searchParams.get('endDate'));
  const compareStartDate = parseDate(url.searchParams.get('compareStartDate'));
  const compareEndDate = parseDate(url.searchParams.get('compareEndDate'));
  const granularity = (url.searchParams.get('granularity') as 'daily' | 'weekly') || 'daily';
  const appealId = url.searchParams.get('appealId');
  const fundId = url.searchParams.get('fundId');
  const frequency = url.searchParams.get('frequency') || 'all';

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Missing startDate/endDate' }, { status: 400 });
  }

  const params = {
    startDate,
    endDate,
    appealId: appealId ? Number(appealId) : null,
    fundId: fundId ? Number(fundId) : null,
    frequency: (frequency as any) || 'all'
  } as const;

  let synthetic = false;
  let data: any;
  try {
    const [agg, trendData, cmpAgg, cmpTrend] = await Promise.all([
      aggregateRevenue(params, 'total-raised'),
      revenueTrend(params, 'total-raised', granularity),
      compareStartDate && compareEndDate ? aggregateRevenue({ ...params, startDate: compareStartDate, endDate: compareEndDate }, 'total-raised') : Promise.resolve(null),
      compareStartDate && compareEndDate ? revenueTrend({ ...params, startDate: compareStartDate, endDate: compareEndDate }, 'total-raised', granularity) : Promise.resolve(null)
    ]);

    data = {
      currentPeriod: agg,
      comparisonPeriod: cmpAgg || undefined,
      trendData,
      comparisonTrend: cmpTrend || undefined
    };
  } catch (e) {
    synthetic = true;
    const trendData = generateSynthetic(startDate, endDate, granularity);
    const comparisonTrend = compareStartDate && compareEndDate ? generateSynthetic(compareStartDate, compareEndDate, granularity) : null;
    const sumAmount = (arr: { amount: number }[]) => arr.reduce((s, x) => s + (x.amount || 0), 0);
    const sumCount = (arr: { count: number }[]) => arr.reduce((s, x) => s + (x.count || 0), 0);
    data = {
      currentPeriod: {
        totalAmount: sumAmount(trendData),
        donationCount: sumCount(trendData),
        averageDonation: trendData.length ? Math.round((sumAmount(trendData) / Math.max(1, sumCount(trendData))) * 100) / 100 : 0,
      },
      comparisonPeriod: comparisonTrend ? {
        totalAmount: sumAmount(comparisonTrend),
        donationCount: sumCount(comparisonTrend),
        averageDonation: comparisonTrend.length ? Math.round((sumAmount(comparisonTrend) / Math.max(1, sumCount(comparisonTrend))) * 100) / 100 : 0,
      } : undefined,
      trendData,
      comparisonTrend: comparisonTrend || undefined,
    };
  }

  const res = NextResponse.json({
    success: true,
    data,
    meta: {
      granularity,
      cached: false,
      lastUpdated: new Date().toISOString(),
      filters: { appealId: appealId ? Number(appealId) : null, fundId: fundId ? Number(fundId) : null, frequency },
      synthetic
    }
  });
  const t1 = (globalThis.performance || { now: () => Date.now() }).now();
  const dur = Math.max(0, Math.round(t1 - t0));
  res.headers.set('Server-Timing', `app;dur=${dur}`);
  res.headers.set('X-Response-Time-ms', String(dur));
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=150');
  return res;
}
