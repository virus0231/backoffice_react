// Utilities to build PHP API URLs for the frontend

function normalizeBase(base?: string): string {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/**
 * Get API base URL for the selected client
 * This function should be called from client components only
 */
export function getPhpApiBase(clientId?: string): string {
  // If no client specified, try to get from store (client-side only)
  let selectedClient = clientId;

  if (!selectedClient && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('insights-filter-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        selectedClient = parsed.state?.selectedClient || 'mausa';
      }
    } catch {
      selectedClient = 'mausa';
    }
  }

  // Map client IDs to their API URLs (must be explicit for Next.js env vars)
  const clientUrls: Record<string, string | undefined> = {
    'mausa': process.env.NEXT_PUBLIC_API_URL_MAUSA,
    'amoud': process.env.NEXT_PUBLIC_API_URL_AMOUD,
  };

  const clientUrl = clientUrls[selectedClient || 'mausa'];

  if (clientUrl) {
    return normalizeBase(clientUrl);
  }

  // Fallback to default
  const fromEnv = normalizeBase(process.env.NEXT_PUBLIC_PHP_API_BASE_URL);
  return fromEnv || '/php-api';
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
  // Always use 'mausa' client for login
  const base = getPhpApiBase('mausa');
  if (!base) return '/login.php';
  const url = new URL(`${base}/login.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}

export function buildAddUserUrl(): string {
  // Use 'mausa' client for user creation
  const base = getPhpApiBase('mausa');
  if (!base) return '/add_user.php';
  const url = new URL(`${base}/add_user.php`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return url.toString();
}
