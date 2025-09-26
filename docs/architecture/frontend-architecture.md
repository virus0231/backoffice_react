# Frontend Architecture

This section outlines the Next.js App Router frontend architecture, component structure, and client-side patterns that deliver the exact FundraisUP interface replication with optimal performance for cPanel hosting.

## Next.js App Router Structure

The frontend leverages Next.js 14+ App Router for optimal server-side rendering and client-side interactivity:

```
apps/web/app/
├── (dashboard)/                    # Route group for authenticated pages
│   ├── layout.tsx                 # Dashboard layout with sidebar
│   ├── page.tsx                   # Main dashboard page (/)
│   ├── donors/
│   │   ├── page.tsx              # Donor management (/donors)
│   │   └── [id]/page.tsx         # Individual donor (/donors/[id])
│   ├── campaigns/
│   │   ├── page.tsx              # Campaign analytics (/campaigns)
│   │   └── [id]/page.tsx         # Campaign details (/campaigns/[id])
│   └── reports/
│       ├── page.tsx              # Reports dashboard (/reports)
│       └── export/page.tsx       # Export interface (/reports/export)
├── api/                          # API routes (covered in API section)
├── globals.css                   # Global Tailwind styles
├── layout.tsx                    # Root layout with providers
└── page.tsx                      # Landing page
```

## Component Architecture

### Component Hierarchy
```
Dashboard Layout
├── Header (Server Component)
│   ├── UserMenu (Client Component)
│   └── NotificationBell (Client Component)
├── Sidebar (Server Component)
│   └── NavigationMenu (Client Component)
└── Main Content Area
    ├── FilterBar (Client Component)
    │   ├── DateRangePicker (Client Component)
    │   ├── CampaignSelector (Client Component)
    │   └── FundSelector (Client Component)
    └── ChartGrid (Server Component wrapper)
        ├── TotalRaisedChart (Client Component)
        ├── DonationTrendsChart (Client Component)
        ├── DonorSegmentationChart (Client Component)
        └── CampaignPerformanceChart (Client Component)
```

### Core Components

**Dashboard Layout Component**
```typescript
// apps/web/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FilterProvider } from '@/providers/FilterProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </FilterProvider>
  );
}
```

**Chart Component Pattern**
```typescript
// apps/web/components/charts/TotalRaisedChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { useDashboardQuery } from '@/hooks/useDashboardQuery';

interface TotalRaisedChartProps {
  initialData: TotalRaisedData;
}

export function TotalRaisedChart({ initialData }: TotalRaisedChartProps) {
  const { dateRange, selectedCampaign, selectedFund } = useFilterStore();

  const { data, isLoading, error } = useDashboardQuery({
    endpoint: '/api/v1/analytics/total-raised',
    params: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      campaignId: selectedCampaign?.id,
      fundId: selectedFund?.id,
    },
    initialData,
    enabled: true
  });

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Total Raised</h3>
        <div className="text-2xl font-bold text-green-600">
          ${data.currentPeriod.totalRaised.toLocaleString()}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.trendData}>
          <XAxis dataKey="period" />
          <YAxis />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#059669"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {data.comparisonPeriod && (
        <ComparisonIndicator growth={data.growth} />
      )}
    </div>
  );
}
```

## State Management with Zustand

### Filter Store
```typescript
// apps/web/stores/filterStore.ts
import { create } from 'zustand';
import { DateRange, Campaign, Fund } from '@packages/shared/types';

interface FilterState {
  dateRange: DateRange;
  selectedCampaign: Campaign | null;
  selectedFund: Fund | null;
  comparisonPeriod: DateRange | null;

  // Actions
  setDateRange: (range: DateRange) => void;
  setCampaign: (campaign: Campaign | null) => void;
  setFund: (fund: Fund | null) => void;
  setComparisonPeriod: (range: DateRange | null) => void;
  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: {
    startDate: new Date(new Date().getFullYear(), 0, 1), // This year
    endDate: new Date()
  },
  selectedCampaign: null,
  selectedFund: null,
  comparisonPeriod: null,

  setDateRange: (range) => set({ dateRange: range }),
  setCampaign: (campaign) => set({ selectedCampaign: campaign }),
  setFund: (fund) => set({ selectedFund: fund }),
  setComparisonPeriod: (range) => set({ comparisonPeriod: range }),
  clearAllFilters: () => set({
    selectedCampaign: null,
    selectedFund: null,
    comparisonPeriod: null
  }),
}));
```

### Chart Data Cache Store
```typescript
// apps/web/stores/chartDataStore.ts
import { create } from 'zustand';

interface ChartDataState {
  cache: Map<string, { data: any; timestamp: number }>;

  // Actions
  getCachedData: (key: string) => any | null;
  setCachedData: (key: string, data: any) => void;
  clearExpiredCache: () => void;
}

export const useChartDataStore = create<ChartDataState>((set, get) => ({
  cache: new Map(),

  getCachedData: (key) => {
    const cached = get().cache.get(key);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min TTL
      return cached.data;
    }
    return null;
  },

  setCachedData: (key, data) => {
    const cache = new Map(get().cache);
    cache.set(key, { data, timestamp: Date.now() });
    set({ cache });
  },

  clearExpiredCache: () => {
    const cache = new Map(get().cache);
    const now = Date.now();

    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > 5 * 60 * 1000) {
        cache.delete(key);
      }
    }

    set({ cache });
  },
}));
```

## Custom Hooks

### Dashboard Data Fetching Hook
```typescript
// apps/web/hooks/useDashboardQuery.ts
import { useState, useEffect } from 'react';
import { useChartDataStore } from '@/stores/chartDataStore';

interface UseDashboardQueryProps {
  endpoint: string;
  params: Record<string, any>;
  initialData?: any;
  enabled?: boolean;
}

export function useDashboardQuery({
  endpoint,
  params,
  initialData,
  enabled = true
}: UseDashboardQueryProps) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { getCachedData, setCachedData } = useChartDataStore();

  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

  const fetchData = async () => {
    if (!enabled) return;

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value != null)
      ).toString();

      const response = await fetch(`${endpoint}?${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setData(result.data);
      setCachedData(cacheKey, result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, JSON.stringify(params), enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
```

## Responsive Design System

### Tailwind Configuration for FundraisUP Replication
```typescript
// apps/web/tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // FundraisUP brand colors
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### Responsive Chart Grid
```typescript
// apps/web/components/dashboard/ChartGrid.tsx
export function ChartGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {children}
    </div>
  );
}

// Usage in dashboard page
export default function DashboardPage() {
  return (
    <>
      <FilterBar />
      <ChartGrid>
        <TotalRaisedChart />
        <DonationTrendsChart />
        <DonorSegmentationChart />
        <CampaignPerformanceChart />
      </ChartGrid>
    </>
  );
}
```

## Performance Optimization

### Server Component Data Prefetching
```typescript
// apps/web/app/(dashboard)/page.tsx
import { Suspense } from 'react';
import { ChartGrid } from '@/components/dashboard/ChartGrid';
import { TotalRaisedChart } from '@/components/charts/TotalRaisedChart';
import { getDashboardData } from '@/lib/server/dashboardData';

export default async function DashboardPage() {
  // Server-side data fetching for initial load
  const initialData = await getDashboardData({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  });

  return (
    <>
      <FilterBar />
      <ChartGrid>
        <Suspense fallback={<ChartSkeleton />}>
          <TotalRaisedChart initialData={initialData.totalRaised} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <DonationTrendsChart initialData={initialData.trends} />
        </Suspense>
        {/* ... other charts */}
      </ChartGrid>
    </>
  );
}
```

### Progressive Enhancement Pattern
```typescript
// apps/web/components/charts/BaseChart.tsx
'use client';

import { useEffect, useState } from 'react';

interface BaseChartProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function BaseChart({ children, fallback }: BaseChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Progressive enhancement: show fallback on server, interactive chart on client
  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## Error Boundaries and Loading States

### Chart Error Boundary
```typescript
// apps/web/components/charts/ChartErrorBoundary.tsx
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ChartErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="text-red-500 mb-2">⚠️ Chart Error</div>
        <p className="text-sm text-gray-600 mb-4">
          Unable to load chart data. Please try refreshing.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ChartErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```
