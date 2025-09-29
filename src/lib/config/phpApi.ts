// Utilities to build PHP API URLs for the frontend

function normalizeBase(base?: string): string {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function getPhpApiBase(): string {
  const base = normalizeBase(process.env.NEXT_PUBLIC_PHP_API_BASE_URL);
  return base || '';
}

export function buildAppealsUrl(): string {
  const base = getPhpApiBase();
  return `${base}/filters/appeals.php`;
}

export function buildFundsUrl(appealIds?: number[]): string {
  const base = getPhpApiBase();
  if (!base) return '/filters/funds.php';
  const url = new URL(`${base}/filters/funds.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (appealIds && appealIds.length) {
    url.searchParams.set('appeal_ids', appealIds.join(','));
  }
  return url.toString();
}

export function buildAnalyticsUrl(kind: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('kind', kind);
    return `/analytics.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/analytics.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('kind', kind);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

