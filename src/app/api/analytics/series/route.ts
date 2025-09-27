import { NextResponse } from 'next/server';

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function generateSeries(start: Date, end: Date) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const out = [] as { date: string; value: number }[];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    // simple synthetic pattern
    const value = Math.round(100 + 20 * Math.sin(i / 2));
    out.push({ date: d.toISOString().slice(0, 10), value });
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startDate = parseDate(url.searchParams.get('startDate'));
  const endDate = parseDate(url.searchParams.get('endDate'));
  const compareStartDate = parseDate(url.searchParams.get('compareStartDate'));
  const compareEndDate = parseDate(url.searchParams.get('compareEndDate'));

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Missing startDate/endDate' }, { status: 400 });
  }

  const current = generateSeries(startDate, endDate);
  const comparison = compareStartDate && compareEndDate ? generateSeries(compareStartDate, compareEndDate) : null;

  return NextResponse.json({ success: true, current, comparison });
}

