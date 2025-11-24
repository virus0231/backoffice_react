/**
 * Utilities to overlay current and comparison series for charting
 */

export interface Point {
  date: string | Date;
  value: number | null;
}

export interface OverlayPoint {
  date: string | Date;
  current: number | null;
  comparison: number | null;
}

/**
 * Overlay by index alignment (use when series are pre-aligned and equal length)
 */
export const overlayByIndex = (current: Point[], comparison?: Point[] | null): OverlayPoint[] => {
  if (!comparison || comparison.length === 0) {
    return current.map(p => ({ date: p.date, current: p.value, comparison: null }));
  }
  const len = Math.max(current.length, comparison.length);
  const out: OverlayPoint[] = [];
  for (let i = 0; i < len; i++) {
    const c = current[i];
    const cmp = comparison[i];
    out.push({
      date: (c?.date ?? cmp?.date) as any,
      current: c?.value ?? null,
      comparison: cmp?.value ?? null
    });
  }
  return out;
};

/**
 * Overlay by date key; merges on the date string key.
 * Dates are normalized to ISO date strings as keys.
 */
export const overlayByDate = (current: Point[], comparison?: Point[] | null): OverlayPoint[] => {
  const map = new Map<string, OverlayPoint>();
  const keyOf = (d: string | Date) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());

  for (const p of current) {
    const k = keyOf(p.date);
    map.set(k, { date: p.date, current: p.value, comparison: null });
  }

  if (comparison) {
    for (const q of comparison) {
      const k = keyOf(q.date);
      if (map.has(k)) {
        const ex = map.get(k)!;
        ex.comparison = q.value;
      } else {
        map.set(k, { date: q.date, current: null, comparison: q.value });
      }
    }
  }

  // Sort by date asc
  return Array.from(map.values()).sort((a, b) => new Date(a.date as any).getTime() - new Date(b.date as any).getTime());
};

