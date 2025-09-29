# Source Tree Architecture

## Overview
This document describes the structure and organization of the Insights project source code. The project follows a clear separation of concerns with distinct layers for presentation, business logic, utilities, and API integration.

## Root Directory Structure

```
insights/
├── .next/                      # Next.js build output (auto-generated)
├── docs/                       # Project documentation
│   └── architecture/          # Architecture documentation
├── node_modules/              # Dependencies (auto-generated)
├── php-api/                   # Backend PHP API
├── public/                    # Static assets
├── scripts/                   # Build and utility scripts
├── src/                       # Frontend source code
├── .env.example              # Environment variables template
├── .env.local               # Local environment variables
├── .gitignore               # Git ignore rules
├── CLAUDE.md                # Claude AI configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.js           # Next.js configuration
├── package.json             # NPM dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # Project documentation
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Source Directory Structure (`/src`)

### Application Layer (`/app`)
```
src/app/
├── dashboard/                 # Dashboard-specific routes
│   ├── layout.tsx            # Dashboard layout wrapper
│   └── page.tsx              # Main dashboard page with charts
├── globals.css               # Global CSS styles
├── layout.tsx               # Root application layout
└── page.tsx                 # Landing/home page
```

**Purpose**: Next.js app router structure defining routes and layouts.

### Component Layer (`/components`)

#### Chart Components (`/components/charts`)
```
src/components/charts/
├── configs/                   # Chart configuration objects
│   └── areaChartConfig.ts    # Area chart default configurations
├── AreaOverlayChart.tsx      # Area chart with comparison overlay
├── BaseChart.tsx             # Base chart wrapper component
├── ChartWrapper.tsx          # Common chart container
├── ComparisonDatePicker.tsx  # Date picker for chart comparisons
├── ComparisonIndicator.tsx   # Visual comparison indicators
├── ComparisonTable.tsx       # Tabular comparison display
├── ComparisonToggle.tsx      # Toggle for comparison mode
├── DonutChart.tsx           # Donut/pie chart component
├── GenericBarChart.tsx      # Configurable bar chart
├── HeatmapGrid.tsx          # Grid-based heatmap visualization
└── PercentageChangeBadge.tsx # Badge showing percentage changes
```

**Purpose**: Reusable data visualization components built on Recharts.

#### Common Components (`/components/common`)
```
src/components/common/
├── ChartErrorFallback.tsx    # Error fallback for chart failures
├── DualMonthDatePicker.tsx   # Two-month date picker widget
├── ErrorBoundary.tsx         # React error boundary wrapper
├── LoadingSpinner.tsx        # Animated loading indicator
└── LoadingState.tsx          # Full loading state display
```

**Purpose**: Shared UI components used across the application.

#### Dashboard Components (`/components/dashboard`)
```
src/components/dashboard/
└── PrimaryRevenueDashboard.tsx # Main revenue analytics dashboard
```

**Purpose**: Page-level dashboard components combining multiple charts and data sources.

#### Filter Components (`/components/filters`)
```
src/components/filters/
├── components/               # Shared filter sub-components
│   ├── CheckboxItem.tsx     # Reusable checkbox list item
│   ├── EmptyState.tsx       # Empty state display
│   ├── SearchInput.tsx      # Search input with clear functionality
│   └── StatusBadge.tsx      # Status indicator badges
├── AppealsFilter.tsx        # Multi-select appeals filter
├── DateRangePicker.tsx      # Advanced date range picker
├── FilterBar.tsx            # Container for all filters
├── FrequencyFilter.tsx      # Donation frequency filter
├── FundsFilter.tsx          # Cascading funds filter
└── index.ts                 # Filter exports
```

**Purpose**: Advanced filtering system with search, multi-select, and cascading dependencies.

#### Layout Components (`/components/layout`)
```
src/components/layout/
├── Header.tsx               # Application header
├── RightSidebarNav.tsx      # Right sidebar navigation
└── Sidebar.tsx              # Main sidebar navigation
```

**Purpose**: Application shell and navigation components.

### Business Logic Layer

#### Custom Hooks (`/hooks`)
```
src/hooks/
├── useComparison.ts         # Hook for chart comparison logic
└── useRevenueData.ts        # Hook for revenue data fetching with caching
```

**Purpose**: Custom React hooks encapsulating complex stateful logic and API integration.

#### State Management (`/stores`)
```
src/stores/
└── filterStore.ts           # Zustand store for global filter state
```

**Purpose**: Global state management using Zustand with persistence.

#### Providers (`/providers`)
```
src/providers/
└── FilterProvider.tsx       # React context provider for filters
```

**Purpose**: React context providers for dependency injection.

### Library Layer (`/lib`)

#### Caching (`/lib/cache`)
```
src/lib/cache/
└── apiCache.ts              # Multi-layer API caching system
```

**Purpose**: Intelligent caching with memory, localStorage, and request deduplication.

#### Calculations (`/lib/calculations`)
```
src/lib/calculations/
└── percentageChange.ts      # Percentage change calculations
```

**Purpose**: Business logic calculations and data transformations.

#### Configuration (`/lib/config`)
```
src/lib/config/
└── phpApi.ts                # PHP API URL building and configuration
```

**Purpose**: Configuration utilities for API integration.

#### Monitoring (`/lib/monitoring`)
```
src/lib/monitoring/
├── analytics.ts             # Client-side analytics and event tracking
└── performance.ts           # Performance monitoring utilities
```

**Purpose**: Production monitoring, analytics, and performance tracking.

#### Utilities (`/lib/utils`)
```
src/lib/utils/
├── comparisonOverlay.ts     # Chart comparison utility functions
├── dateHelpers.ts           # Date manipulation and formatting
├── errorHandling.ts         # Comprehensive error handling system
└── sanitization.ts          # Input sanitization utilities
```

**Purpose**: Pure utility functions for common operations.

#### Validation (`/lib/validation`)
```
src/lib/validation/
└── comparisonDates.ts       # Date range validation logic
```

**Purpose**: Input validation and business rule enforcement.

### Type Definitions (`/types`)
```
src/types/
├── charts.ts                # Chart-related TypeScript interfaces
├── filters.ts               # Filter-related TypeScript interfaces
└── next-auth-jwt.d.ts       # NextAuth JWT type declarations
```

**Purpose**: TypeScript type definitions and interfaces.

## Backend Structure (`/php-api`)

```
php-api/
├── filters/                  # Filter-specific API endpoints
│   ├── appeals.php          # Appeals data endpoint
│   └── funds.php            # Funds data endpoint (with appeal filtering)
├── _bootstrap.php           # Common initialization and utilities
├── analytics.php            # Main analytics data endpoint
└── config.php               # Database and application configuration
```

**Purpose**: RESTful PHP API providing data to the frontend with proper error handling and response formatting.

## Configuration Files

### Build Configuration
- **`next.config.js`**: Next.js configuration with cPanel optimizations
- **`tsconfig.json`**: TypeScript compiler configuration with strict settings
- **`tailwind.config.js`**: Tailwind CSS configuration with custom design system
- **`postcss.config.js`**: PostCSS processing configuration
- **`eslint.config.mjs`**: ESLint rules and code quality settings

### Environment Configuration
- **`.env.example`**: Template for environment variables
- **`.env.local`**: Local development environment variables
- **`package.json`**: Dependencies, scripts, and project metadata

## Architecture Patterns

### Component Patterns

#### Presentation Components
- Located in `/components/common` and `/components/charts`
- Pure components with minimal business logic
- Reusable across different contexts
- Well-typed props interfaces

#### Container Components
- Located in `/components/dashboard` and page components
- Orchestrate data fetching and state management
- Compose smaller presentation components
- Handle error boundaries and loading states

#### Hook-based Logic
- Custom hooks in `/hooks` encapsulate complex stateful logic
- Separate data fetching from presentation
- Enable easy testing and reuse
- Proper dependency management

### State Management Patterns

#### Global State (Zustand)
```typescript
// Filter store pattern
interface FilterStore extends FilterState {
  // State properties
  dateRange: DateRange;
  selectedAppeals: Appeal[];

  // Actions
  setDateRange: (range: DateRange) => void;
  setAppeals: (appeals: Appeal[]) => void;

  // Computed properties
  hasActiveFilters: boolean;
}
```

#### Local State (React)
- Component-specific state using `useState`
- Async operations with loading/error states
- Form state management
- UI interaction state

### Data Flow Patterns

#### API Integration
```
Component → Hook → Cache → API → Database
         ← Hook ← Cache ← API ←
```

#### Error Handling
```
API Error → Error Classes → Format for Display → User Feedback
          → Logging → Analytics → Monitoring
```

#### Caching Strategy
```
Memory Cache (fast) → localStorage (persistent) → API (source of truth)
```

## File Naming Conventions

### Components
- **PascalCase**: `LoadingSpinner.tsx`, `ChartErrorFallback.tsx`
- **Descriptive names**: Clearly indicate component purpose
- **Type suffix**: Components end with `.tsx`

### Utilities and Logic
- **camelCase**: `errorHandling.ts`, `dateHelpers.ts`
- **Purpose-based**: Named after their primary function
- **Type suffix**: Logic files end with `.ts`

### Types and Interfaces
- **PascalCase**: `interface RevenueDataPoint`
- **Descriptive**: Clear indication of data structure
- **Grouped**: Related types in same file (`filters.ts`, `charts.ts`)

## Import/Export Patterns

### Path Aliases
```typescript
// Configured in tsconfig.json
import { Component } from '@/components/common/Component';
import { utility } from '@/lib/utils/utility';
import { useHook } from '@/hooks/useHook';
```

### Export Patterns
```typescript
// Default exports for components
export default function Component() {}

// Named exports for utilities
export function utilityFunction() {}
export const CONSTANT = 'value';
```

### Barrel Exports
```typescript
// src/components/filters/index.ts
export { default as FilterBar } from './FilterBar';
export { default as DateRangePicker } from './DateRangePicker';
export * from './components';
```

## Dependency Management

### Layers and Dependencies
- **Components**: Can depend on hooks, utilities, types
- **Hooks**: Can depend on utilities, stores, API functions
- **Utilities**: Should be dependency-free or minimal dependencies
- **Types**: No dependencies, pure type definitions

### Circular Dependency Prevention
- Clear layer boundaries prevent circular imports
- Shared types in separate files
- Utilities are pure functions
- Components don't import other components directly

This architecture provides clear separation of concerns, maintainable code organization, and scalable patterns for the fundraising analytics dashboard.