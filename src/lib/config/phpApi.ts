// Utilities to build PHP API URLs for the frontend
// Simplified to use single client - matches pattern from src/utils/api.js

/**
 * Get API base URL
 * In development, uses Vite proxy. In production, uses full URL.
 */
export function getPhpApiBase(): string {
  return import.meta.env.DEV
    ? '/backoffice/yoc'  // Development: Use Vite proxy
    : 'https://forgottenwomen.youronlineconversation.com/backoffice/yoc'; // Production: Full URL
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

export function buildRecurringPlansUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/recurring-plans.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/recurring-plans.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildRecurringRevenueUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/recurring-revenue.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/recurring-revenue.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildFrequenciesUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/frequencies.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/frequencies.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildPaymentMethodsUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/payment-methods.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/payment-methods.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildFundsDataUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/funds.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/funds.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildCountriesDataUrl(metric: string, searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    const sp = new URLSearchParams(searchParams);
    sp.set('metric', metric);
    return `/countries.php?${sp.toString()}`;
  }
  const url = new URL(`${base}/countries.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.set('metric', metric);
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildDayTimeUrl(searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    return `/day-time.php?${searchParams.toString()}`;
  }
  const url = new URL(`${base}/day-time.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

export function buildRetentionUrl(searchParams: URLSearchParams): string {
  const base = getPhpApiBase();
  if (!base) {
    return `/retention.php?${searchParams.toString()}`;
  }
  const url = new URL(`${base}/retention.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  for (const [k, v] of searchParams.entries()) url.searchParams.set(k, v);
  return url.toString();
}

// Auth endpoints
export function buildLoginUrl(): string {
  const base = getPhpApiBase();
  if (!base) return '/login.php';
  const url = new URL(`${base}/login.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}

export function buildAddUserUrl(): string {
  const base = getPhpApiBase();
  if (!base) return '/add_user.php';
  const url = new URL(`${base}/add_user.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}
