// Utilities to build API URLs for the frontend
// Uses VITE_API_BASE_URL or defaults to /api/v1 (proxied in dev)

/**
 * Get API base URL
 * In development, uses Vite proxy. In production, uses full URL.
 */
export function getPhpApiBase(): string {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? '/api/v1' : 'https://forgottenwomen.youronlineconversation.com/api/v1')
  );
}

export function buildAppealsUrl(): string {
  const base = getPhpApiBase();
  return `${base}/filters/appeals`;
}

export function buildFundsUrl(appealIds?: number[]): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/filters/funds`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (appealIds && appealIds.length) {
    url.searchParams.set('appeal_ids', appealIds.join(','));
  }
  return url.toString();
}

export function buildAnalyticsUrl(kind: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/analytics`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('kind', kind);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildRecurringPlansUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/recurring-plans`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildRecurringRevenueUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/recurring-revenue`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildFrequenciesUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/frequencies`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildPaymentMethodsUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/payment-methods`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildFundsDataUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/funds`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildCountriesDataUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/countries`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildDayTimeUrl(searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/day-time`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildRetentionUrl(searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/retention`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

// Auth endpoints
export function buildLoginUrl(): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/login`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}

export function buildAddUserUrl(): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/add_user`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}
