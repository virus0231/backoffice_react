# Source Tree Structure

This document defines the complete directory structure and file organization for the Nonprofit Fundraising Analytics Dashboard project. This structure is designed for optimal Next.js App Router development with TypeScript and follows the architecture patterns defined in the project specifications.

## Root Directory Structure

```
insights/
├── .bmad-core/                     # BMAD™ Core agent configuration
│   ├── checklists/
│   ├── tasks/
│   ├── templates/
│   └── core-config.yaml
├── .next/                          # Next.js build output (generated)
├── .ai/                           # AI development logs and debug info
│   └── debug-log.md
├── docs/                          # Project documentation
│   ├── architecture/              # Architecture documentation (sharded)
│   ├── prd/                      # Product requirements (sharded)
│   ├── stories/                  # User stories
│   ├── architecture.md           # Main architecture document
│   ├── brief.md                  # Project brief
│   ├── front-end-spec.md         # Frontend specifications
│   └── prd.md                    # Main product requirements document
├── public/                        # Static assets
├── src/                          # Source code (main application)
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Project dependencies
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project README
```

## Source Code Structure (`src/`)

```
src/
├── app/                           # Next.js App Router directory
│   ├── (dashboard)/              # Route group for authenticated dashboard
│   │   ├── layout.tsx            # Dashboard layout with navigation
│   │   ├── page.tsx              # Main dashboard page (/)
│   │   ├── donors/               # Donor management section
│   │   │   ├── page.tsx          # Donor analytics page (/donors)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual donor details (/donors/[id])
│   │   ├── campaigns/            # Campaign analytics section
│   │   │   ├── page.tsx          # Campaign overview (/campaigns)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Campaign details (/campaigns/[id])
│   │   └── reports/              # Reporting section
│   │       ├── page.tsx          # Reports dashboard (/reports)
│   │       └── export/
│   │           └── page.tsx      # Export interface (/reports/export)
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts      # NextAuth configuration
│   │   │   └── login/
│   │   │       └── route.ts      # Login endpoint
│   │   ├── analytics/            # Analytics data endpoints
│   │   │   ├── donations/
│   │   │   │   ├── route.ts      # Donation analytics
│   │   │   │   ├── count/
│   │   │   │   │   └── route.ts  # Donation count analytics
│   │   │   │   └── revenue/
│   │   │   │       └── route.ts  # Revenue analytics
│   │   │   ├── donors/
│   │   │   │   ├── route.ts      # Donor analytics
│   │   │   │   ├── retention/
│   │   │   │   │   └── route.ts  # Donor retention
│   │   │   │   └── acquisition/
│   │   │   │       └── route.ts  # First-time donors
│   │   │   ├── campaigns/
│   │   │   │   ├── route.ts      # Campaign analytics
│   │   │   │   └── performance/
│   │   │   │       └── route.ts  # Campaign performance
│   │   │   └── traffic/
│   │   │       └── route.ts      # Traffic source analytics
│   │   └── exports/              # Data export endpoints
│   │       ├── csv/
│   │       │   └── route.ts      # CSV export
│   │       └── pdf/
│   │           └── route.ts      # PDF export
│   ├── globals.css               # Global CSS and Tailwind imports
│   ├── layout.tsx                # Root layout component
│   ├── loading.tsx               # Global loading component
│   ├── not-found.tsx             # 404 page component
│   └── page.tsx                  # Landing page component
├── components/                    # React components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts              # Component exports
│   ├── charts/                   # Chart components
│   │   ├── BaseChart.tsx         # Base chart wrapper
│   │   ├── RevenueChart.tsx      # Primary revenue chart
│   │   ├── DonationCountChart.tsx # Donations count chart
│   │   ├── DonorRetentionChart.tsx # Donor retention chart
│   │   ├── FirstTimeDonorsChart.tsx # First-time donors chart
│   │   ├── CampaignChart.tsx     # Campaign performance chart
│   │   ├── TrafficSourceChart.tsx # Traffic source chart
│   │   └── index.ts              # Chart component exports
│   ├── filters/                  # Filter system components
│   │   ├── UniversalFilter.tsx   # Main filter component
│   │   ├── DateFilter.tsx        # Date range filter
│   │   ├── AppealFilter.tsx      # Appeals dropdown
│   │   ├── FundFilter.tsx        # Funds dropdown
│   │   ├── FrequencyFilter.tsx   # Donation frequency filter
│   │   ├── ComparisonToggle.tsx  # Comparison period toggle
│   │   └── index.ts              # Filter component exports
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Main header
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Footer.tsx            # Footer component
│   │   └── DashboardLayout.tsx   # Dashboard layout wrapper
│   ├── analytics/                # Analytics-specific components
│   │   ├── MetricCard.tsx        # Metric display cards
│   │   ├── ChartSection.tsx      # Chart section wrapper
│   │   ├── ComparisonOverlay.tsx # Comparison visualization
│   │   └── ExportControls.tsx    # Export functionality
│   └── common/                   # Common utility components
│       ├── ErrorBoundary.tsx     # Error boundary wrapper
│       ├── LoadingSpinner.tsx    # Loading state component
│       └── NoData.tsx            # No data state component
├── lib/                          # Utility libraries and configurations
│   ├── database/                 # Database configuration
│   │   ├── models/               # Sequelize models
│   │   │   ├── Donation.ts       # Donation model
│   │   │   ├── Donor.ts          # Donor model
│   │   │   ├── Campaign.ts       # Campaign model
│   │   │   ├── Appeal.ts         # Appeal model
│   │   │   ├── Fund.ts           # Fund model
│   │   │   └── index.ts          # Model exports
│   │   ├── connection.ts         # Database connection
│   │   └── migrations/           # Database migrations
│   ├── services/                 # Business logic services
│   │   ├── analytics/            # Analytics services
│   │   │   ├── DonationAnalytics.ts # Donation analytics
│   │   │   ├── DonorAnalytics.ts    # Donor analytics
│   │   │   ├── CampaignAnalytics.ts # Campaign analytics
│   │   │   └── RevenueAnalytics.ts  # Revenue analytics
│   │   ├── exports/              # Export services
│   │   │   ├── CsvExport.ts      # CSV export logic
│   │   │   └── PdfExport.ts      # PDF export logic
│   │   └── filters/              # Filter services
│   │       ├── FilterLogic.ts    # Filter processing
│   │       └── DateUtils.ts      # Date utility functions
│   ├── utils/                    # General utilities
│   │   ├── formatters.ts         # Data formatting utilities
│   │   ├── validators.ts         # Input validation
│   │   ├── constants.ts          # Application constants
│   │   ├── api.ts               # API utilities
│   │   └── date.ts              # Date utilities
│   ├── auth/                     # Authentication configuration
│   │   ├── config.ts            # NextAuth configuration
│   │   └── providers.ts         # Auth providers setup
│   └── cache/                    # Caching utilities
│       ├── memory.ts            # In-memory cache
│       └── keys.ts              # Cache key definitions
├── hooks/                        # Custom React hooks
│   ├── useAnalytics.ts          # Analytics data fetching
│   ├── useFilters.ts            # Filter state management
│   ├── useChartData.ts          # Chart data processing
│   ├── useComparison.ts         # Comparison period logic
│   └── useExport.ts             # Export functionality
├── stores/                       # State management (Zustand)
│   ├── filterStore.ts           # Global filter state
│   ├── chartStore.ts            # Chart configuration state
│   └── userStore.ts             # User session state
├── types/                        # TypeScript type definitions
│   ├── analytics.ts             # Analytics data types
│   ├── charts.ts                # Chart configuration types
│   ├── filters.ts               # Filter types
│   ├── database.ts              # Database model types
│   ├── api.ts                   # API response types
│   └── global.d.ts              # Global type declarations
└── styles/                       # Additional styles
    ├── components.css           # Component-specific styles
    ├── charts.css               # Chart styling overrides
    └── utilities.css            # Utility classes
```

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/stores/*": ["./src/stores/*"]
    }
  }
}
```

### Next.js Configuration (`next.config.js`)
- Database connection configuration
- Environment variable handling
- Build optimization settings
- Static asset handling

### Tailwind Configuration (`tailwind.config.js`)
- Custom color palette matching FundraisUP design
- Chart-specific utility classes
- Responsive breakpoint configuration
- Component class definitions

## Key Directory Patterns

### Feature-Based Organization
Components are organized by feature area rather than type:
- `/charts/` - All chart-related components
- `/filters/` - All filtering functionality
- `/analytics/` - Analytics-specific logic

### API Route Structure
API routes follow RESTful patterns:
- `/api/analytics/donations/` - Donation-related endpoints
- `/api/analytics/donors/` - Donor-related endpoints
- `/api/exports/` - Data export endpoints

### Service Layer Organization
Business logic is separated into service layers:
- Analytics services handle data processing
- Export services handle file generation
- Filter services handle query logic

### Type Safety
TypeScript definitions are centralized in `/types/` for consistency across components and API routes.

## File Naming Conventions

- **Components**: PascalCase (`RevenueChart.tsx`)
- **Utilities**: camelCase (`formatters.ts`)
- **API Routes**: kebab-case directories, `route.ts` files
- **Types**: camelCase with descriptive suffixes (`analytics.ts`)
- **Hooks**: camelCase with `use` prefix (`useAnalytics.ts`)

This structure supports the development of a scalable, maintainable analytics dashboard while adhering to Next.js best practices and the specific requirements outlined in the project documentation.