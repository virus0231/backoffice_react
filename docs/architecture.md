# Insights Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for **Insights** (Nonprofit Fundraising Analytics Dashboard), including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined. The architecture specifically addresses the challenge of transforming raw phpMySQL database data into 15+ interactive analytics visualizations with exact FundraisUP interface replication.

### Starter Template Analysis

After reviewing your PRD and technical assumptions, this is a **greenfield Next.js project** with specific requirements for:
- Next.js 13+ with App Router architecture
- Direct phpMySQL database integration (no data migration required)
- Exact FundraisUP dashboard interface replication
- Recharts visualization library integration

**Decision: N/A - Greenfield project** with clear technical stack already defined in PRD requirements.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-26 | 1.0 | Complete fullstack architecture for cPanel deployment | Winston (Architect) |

## High Level Architecture

### Technical Summary

The Insights dashboard adopts a **full-stack Next.js architecture** with API routes handling MySQL database operations through Sequelize ORM, deployed as a Node.js application on cPanel hosting. The solution uses Next.js App Router with server-side rendering for optimal performance, while API routes in the `/api` directory handle all database connectivity and analytics query processing. Sequelize ORM provides MySQL integration with connection pooling optimized for cPanel's shared hosting environment. The architecture leverages Next.js's built-in caching capabilities combined with Zustand for client-side state management, ensuring sub-3-second load times for the priority chart visualizations through strategic server-side data fetching and client-side hydration.

### Platform and Infrastructure Choice

**Platform:** cPanel Node.js application hosting
**Key Services:**
- **Full-Stack Framework:** Next.js 13+ with App Router
- **Database ORM:** Sequelize with MySQL
- **Hosting:** cPanel Node.js environment
- **Database:** Existing cPanel MySQL database
- **Caching:** Next.js built-in caching + Zustand state management

**Deployment Strategy:**
- **Single Application:** Complete Next.js app deployed to cPanel Node.js
- **Database Connection:** Sequelize connecting to cPanel MySQL
- **Static Assets:** Next.js handles asset optimization and serving
- **API Routes:** Built-in `/api` routes for database operations

### Repository Structure

**Structure:** Single Next.js application with organized feature structure
**Package Organization:**
- `apps/web/` - Main Next.js dashboard application
- `packages/shared/` - TypeScript interfaces and utilities shared between frontend/backend
- `packages/database/` - Database connection utilities and query builders

### High Level Architecture Diagram

```mermaid
graph TB
    A[User Browser] --> B[cPanel Node.js]
    B --> C[Next.js Application]

    C --> D[App Router Pages]
    C --> E[API Routes]
    C --> F[Sequelize ORM]
    F --> G[cPanel MySQL]

    D --> H[Server Components]
    D --> I[Client Components]
    I --> J[Recharts Charts]
    I --> K[Zustand Stores]

    subgraph "Next.js App Structure"
        D --> D1[Dashboard Pages]
        E --> E1[/api/charts/*]
        E --> E2[/api/filters/*]
        E --> E3[/api/export/*]
    end

    subgraph "Data Layer"
        F --> F1[Sequelize Models]
        F --> F2[Connection Pool]
        G --> G1[Existing Tables]
    end

    subgraph "Client State"
        K --> K1[Filter State]
        K --> K2[Chart Data Cache]
        K --> K3[UI State]
    end
```

### Architectural Patterns

**Core patterns for Next.js-only architecture:**

- **App Router Pattern:** Server components for data fetching + client components for interactivity - _Rationale:_ Optimal performance with server-side rendering and client-side hydration
- **API Routes Pattern:** Next.js `/api` directory for all backend functionality - _Rationale:_ Single codebase deployment with built-in API capabilities
- **Server Component Data Fetching:** Initial chart data loaded server-side - _Rationale:_ Faster initial page loads and better SEO performance
- **Client-Side State Management:** Zustand for filter state and real-time updates - _Rationale:_ Reactive UI updates without full page reloads
- **Sequelize Repository Pattern:** Database models abstract data access - _Rationale:_ Type-safe database operations with connection pooling
- **Progressive Enhancement:** Server-rendered baseline with client-side interactivity - _Rationale:_ Works without JavaScript but enhanced with it

## Tech Stack

This is the **DEFINITIVE technology selection** for your entire project. Based on your constraints (cPanel hosting, Next.js only, Sequelize required), here's the comprehensive tech stack:

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.0+ | Type-safe development across entire stack | Essential for complex analytics with 15+ chart types, prevents runtime errors |
| Frontend Framework | Next.js | 14.0+ | Full-stack React framework with App Router | Single framework handles both frontend and backend, optimal for cPanel deployment |
| UI Component Library | Tailwind CSS | 3.4+ | Utility-first styling for exact FundraisUP replication | Pixel-perfect control needed for exact visual fidelity requirements |
| State Management | Zustand | 4.4+ | Lightweight state management for filters and UI | Simpler than Redux, perfect for filter synchronization across charts |
| Backend Language | Node.js | 18+ | JavaScript runtime for Next.js API routes | Required for Next.js, cPanel Node.js support, unified language stack |
| Backend Framework | Next.js API Routes | Built-in | RESTful API endpoints within Next.js | Eliminates separate backend deployment, single codebase for cPanel |
| API Style | REST API | HTTP/1.1 | Standard HTTP endpoints for chart data | Simple integration with existing phpMySQL, no GraphQL complexity needed |
| Database | MySQL | 8.0+ | Existing phpMySQL database | No migration required, direct connection to existing fundraising data |
| Database ORM | Sequelize | 6.35+ | TypeScript-first ORM for MySQL operations | Connection pooling, query optimization, type safety for complex analytics |
| Cache | Node.js Memory Cache | Built-in | In-memory caching for API responses | Simple caching solution that works within cPanel hosting constraints |
| File Storage | cPanel File System | Native | Static asset storage and file uploads | Built-in cPanel storage for exports and static assets |
| Authentication | NextAuth.js | 4.24+ | Authentication for dashboard access | Industry standard for Next.js auth, supports multiple providers |
| Frontend Testing | Jest + React Testing Library | Latest | Component and integration testing | Standard React testing stack, reliable and well-documented |
| Backend Testing | Jest + Supertest | Latest | API route testing with database mocking | Consistent testing framework across frontend/backend |
| E2E Testing | Playwright | Latest | Full dashboard workflow testing | Better than Cypress for complex analytics interactions |
| Build Tool | Next.js Built-in | Native | Webpack-based bundling and optimization | No additional build tool needed, optimized for production deployment |
| Bundler | Webpack | Built-in | Module bundling via Next.js | Automatic code splitting and optimization for chart components |
| IaC Tool | Manual Deployment | N/A | cPanel manual deployment process | No infrastructure as code needed for shared hosting |
| CI/CD | GitHub Actions | Latest | Automated testing and build pipeline | Free tier sufficient for testing and build verification |
| Monitoring | Console Logging | Built-in | Basic error logging and performance monitoring | Simple monitoring solution suitable for shared hosting environment |
| Logging | Winston | 3.11+ | Structured logging for API routes and errors | Professional logging for debugging database and performance issues |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling framework | Primary styling solution for exact FundraisUP replication |
| Chart Library | Recharts | 2.8+ | React-based charting library for analytics visualization | Exact requirement from PRD for FundraisUP interface replication |

## Data Models

This section defines the core data entities and their relationships, providing TypeScript interfaces for frontend use and Sequelize models for backend operations. The data models directly mirror the existing phpMySQL database structure while adding TypeScript type safety.

### Core Data Entities

Based on the existing database schema (`mausayoc_new.sql`) and query patterns (`queries.md`), the system operates on these primary entities:

#### Donation Entity
```typescript
interface Donation {
  id: string;                    // pw_transactions.id
  orderId: string;              // pw_transactions.order_id
  donorId: string;              // pw_transactions.member_id
  campaignId?: string;          // pw_transactions.appeal_id
  fundId?: string;              // pw_transactions.fundlist_id
  amount: number;               // pw_transactions.amount
  frequency: number;            // pw_transactions.freq (0=one-time, 1=first installment, >1=recurring)
  status: 'completed' | 'pending' | 'failed'; // pw_transactions.status
  paymentMethod: string;        // pw_transactions.payment_method
  donationDate: Date;           // pw_transactions.donation_date
  createdAt: Date;              // pw_transactions.created_at
  isFirstInstallment: boolean;  // Derived from order_id NOT REGEXP '_'
}
```

#### Donor Entity
```typescript
interface Donor {
  id: string;                   // pw_donors.id
  firstName: string;            // pw_donors.first_name
  lastName: string;             // pw_donors.last_name
  email: string;                // pw_donors.email
  phone?: string;               // pw_donors.phone
  address?: string;             // pw_donors.address
  city?: string;                // pw_donors.city
  state?: string;               // pw_donors.state
  zipCode?: string;             // pw_donors.zip_code
  country: string;              // pw_donors.country
  registrationDate: Date;       // pw_donors.created_at
  totalDonated: number;         // Calculated field
  donationCount: number;        // Calculated field
  lastDonationDate?: Date;      // Calculated field
}
```

#### Campaign Entity (Appeal)
```typescript
interface Campaign {
  id: string;                   // pw_appeal.id
  name: string;                 // pw_appeal.appeal_name
  description?: string;         // pw_appeal.description
  startDate: Date;              // pw_appeal.start_date
  endDate?: Date;               // pw_appeal.end_date
  goalAmount?: number;          // pw_appeal.goal_amount
  status: 'active' | 'paused' | 'completed'; // pw_appeal.status
  createdAt: Date;              // pw_appeal.created_at
  totalRaised: number;          // Calculated field
  donorCount: number;           // Calculated field
}
```

#### Fund Entity
```typescript
interface Fund {
  id: string;                   // pw_fundlist.id
  name: string;                 // pw_fundlist.fund_name
  description?: string;         // pw_fundlist.description
  category?: string;            // pw_fundlist.category
  isActive: boolean;            // pw_fundlist.is_active
  createdAt: Date;              // pw_fundlist.created_at
  totalRaised: number;          // Calculated field
  donorCount: number;           // Calculated field
}
```

### Sequelize Model Definitions

#### Donation Model
```typescript
// packages/database/models/Donation.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';

interface DonationAttributes {
  id: string;
  orderId: string;
  donorId: string;
  campaignId?: string;
  fundId?: string;
  amount: number;
  frequency: number;
  status: string;
  paymentMethod: string;
  donationDate: Date;
  createdAt: Date;
}

interface DonationCreationAttributes extends Optional<DonationAttributes, 'id' | 'createdAt'> {}

export class DonationModel extends Model<DonationAttributes, DonationCreationAttributes>
  implements DonationAttributes {
  public id!: string;
  public orderId!: string;
  public donorId!: string;
  public campaignId?: string;
  public fundId?: string;
  public amount!: number;
  public frequency!: number;
  public status!: string;
  public paymentMethod!: string;
  public donationDate!: Date;
  public createdAt!: Date;

  // Associations
  public readonly donor?: DonorModel;
  public readonly campaign?: CampaignModel;
  public readonly fund?: FundModel;
}

DonationModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'id'
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id'
  },
  donorId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'member_id'
  },
  campaignId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'appeal_id'
  },
  fundId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'fundlist_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'freq'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'payment_method'
  },
  donationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'donation_date'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  }
}, {
  sequelize,
  tableName: 'pw_transactions',
  timestamps: false
});
```

### Model Relationships

```typescript
// packages/database/associations.ts
import { DonationModel } from './models/Donation';
import { DonorModel } from './models/Donor';
import { CampaignModel } from './models/Campaign';
import { FundModel } from './models/Fund';

// Donation belongs to Donor
DonationModel.belongsTo(DonorModel, {
  foreignKey: 'donorId',
  as: 'donor'
});

// Donor has many Donations
DonorModel.hasMany(DonationModel, {
  foreignKey: 'donorId',
  as: 'donations'
});

// Donation belongs to Campaign
DonationModel.belongsTo(CampaignModel, {
  foreignKey: 'campaignId',
  as: 'campaign'
});

// Campaign has many Donations
CampaignModel.hasMany(DonationModel, {
  foreignKey: 'campaignId',
  as: 'donations'
});

// Donation belongs to Fund
DonationModel.belongsTo(FundModel, {
  foreignKey: 'fundId',
  as: 'fund'
});

// Fund has many Donations
FundModel.hasMany(DonationModel, {
  foreignKey: 'fundId',
  as: 'donations'
});
```

### Calculated Fields and Query Helpers

```typescript
// packages/database/helpers/calculatedFields.ts
import { DonationModel, DonorModel } from '../models';
import { Op } from 'sequelize';

export class CalculatedFields {
  /**
   * Calculate total raised for a time period
   * Includes first installments: freq=1 AND order_id NOT REGEXP '_'
   * Includes one-time donations: freq=0
   */
  static async getTotalRaised(startDate: Date, endDate: Date): Promise<number> {
    const result = await DonationModel.sum('amount', {
      where: {
        donationDate: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed',
        [Op.or]: [
          { frequency: 0 }, // One-time donations
          {
            frequency: 1,
            orderId: {
              [Op.notRegexp]: '_' // First installments
            }
          }
        ]
      }
    });
    return result || 0;
  }

  /**
   * Calculate donor metrics with lifetime value
   */
  static async getDonorMetrics(donorId: string) {
    const totalDonated = await DonationModel.sum('amount', {
      where: {
        donorId,
        status: 'completed'
      }
    });

    const donationCount = await DonationModel.count({
      where: {
        donorId,
        status: 'completed'
      }
    });

    const lastDonation = await DonationModel.findOne({
      where: {
        donorId,
        status: 'completed'
      },
      order: [['donationDate', 'DESC']]
    });

    return {
      totalDonated: totalDonated || 0,
      donationCount,
      lastDonationDate: lastDonation?.donationDate
    };
  }
}
```

## API Specification

This section defines the RESTful API endpoints that power the analytics dashboard. All APIs are implemented as Next.js API routes in the `/api` directory, providing JSON responses for chart data, filtering options, and data export functionality.

### API Overview

The API follows RESTful conventions with these key patterns:
- **Base URL:** `/api/v1/`
- **Content Type:** `application/json`
- **Authentication:** NextAuth.js session-based
- **Error Format:** Consistent error response structure
- **Caching:** Response caching for performance optimization

### Core API Endpoints

#### Analytics Data Endpoints

**GET `/api/v1/analytics/total-raised`**
- **Purpose:** Total amount raised with time period filtering
- **Parameters:**
  - `startDate` (ISO string): Start of time period
  - `endDate` (ISO string): End of time period
  - `compareStartDate` (ISO string, optional): Comparison period start
  - `compareEndDate` (ISO string, optional): Comparison period end
  - `campaignId` (string, optional): Filter by specific campaign
  - `fundId` (string, optional): Filter by specific fund

```typescript
// Request
GET /api/v1/analytics/total-raised?startDate=2024-01-01&endDate=2024-12-31

// Response
{
  "data": {
    "currentPeriod": {
      "totalRaised": 125450.00,
      "donationCount": 847,
      "averageDonation": 148.11
    },
    "comparisonPeriod": {
      "totalRaised": 98320.00,
      "donationCount": 723,
      "averageDonation": 135.96
    },
    "growth": {
      "amount": 27.6,
      "percentage": 28.1,
      "direction": "up"
    }
  },
  "meta": {
    "cached": true,
    "lastUpdated": "2024-09-26T10:30:00Z"
  }
}
```

**GET `/api/v1/analytics/donation-trends`**
- **Purpose:** Time-series data for donation trend visualization
- **Parameters:**
  - `startDate`, `endDate`: Time period
  - `granularity`: "day", "week", "month", "quarter"
  - `includeFirstInstallments`: boolean (default: true)
  - `includeOneTime`: boolean (default: true)

```typescript
// Request
GET /api/v1/analytics/donation-trends?granularity=month

// Response
{
  "data": [
    {
      "period": "2024-01",
      "totalRaised": 12450.00,
      "donationCount": 89,
      "firstInstallments": 8920.00,
      "oneTimeDonations": 3530.00
    },
    {
      "period": "2024-02",
      "totalRaised": 15680.00,
      "donationCount": 102,
      "firstInstallments": 11240.00,
      "oneTimeDonations": 4440.00
    }
  ]
}
```

**GET `/api/v1/analytics/donor-segments`**
- **Purpose:** Donor segmentation and lifetime value analysis
- **Parameters:**
  - `segment`: "new", "returning", "lapsed", "major"
  - `minDonation`: number (optional)
  - `maxDonation`: number (optional)

```typescript
// Response
{
  "data": {
    "segments": [
      {
        "name": "Major Donors",
        "count": 45,
        "totalRaised": 67800.00,
        "averageDonation": 1506.67,
        "percentage": 54.1
      },
      {
        "name": "Regular Donors",
        "count": 234,
        "totalRaised": 45620.00,
        "averageDonation": 194.96,
        "percentage": 36.4
      }
    ]
  }
}
```

#### Campaign and Fund Analytics

**GET `/api/v1/analytics/campaigns`**
- **Purpose:** Campaign performance with goal tracking
- **Parameters:**
  - `status`: "active", "completed", "all"
  - `sortBy`: "totalRaised", "goalProgress", "donorCount"
  - `limit`: number (default: 10)

**GET `/api/v1/analytics/funds`**
- **Purpose:** Fund allocation and performance analysis
- **Parameters:** Similar to campaigns endpoint

#### Filter Data Endpoints

**GET `/api/v1/filters/campaigns`**
- **Purpose:** Available campaigns for filter dropdowns
```typescript
// Response
{
  "data": [
    {
      "id": "camp_001",
      "name": "Annual Giving Campaign 2024",
      "isActive": true,
      "donationCount": 156
    }
  ]
}
```

**GET `/api/v1/filters/funds`**
- **Purpose:** Available funds for filter dropdowns

**GET `/api/v1/filters/date-ranges`**
- **Purpose:** Predefined date ranges (This Year, Last Quarter, etc.)

#### Export Endpoints

**POST `/api/v1/export/csv`**
- **Purpose:** Generate CSV export of filtered data
- **Request Body:**
```typescript
{
  "dataType": "donations" | "donors" | "campaigns",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "campaignId": "camp_001"
  },
  "columns": ["donorName", "amount", "donationDate", "campaign"]
}
```

**POST `/api/v1/export/pdf`**
- **Purpose:** Generate PDF report of analytics dashboard

### API Implementation Pattern

#### Base API Route Structure
```typescript
// apps/web/app/api/v1/analytics/total-raised/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CalculatedFields } from '@packages/database/helpers/calculatedFields';
import { validateDateRange, handleApiError } from '@packages/shared/utils/api';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and validate parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.isValid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    // Business logic
    const totalRaised = await CalculatedFields.getTotalRaised(
      new Date(startDate!),
      new Date(endDate!)
    );

    // Response with caching headers
    const response = NextResponse.json({
      data: {
        currentPeriod: {
          totalRaised,
          // ... other calculated fields
        }
      },
      meta: {
        cached: false,
        lastUpdated: new Date().toISOString()
      }
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Error Handling

**Standard Error Response Format:**
```typescript
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "End date must be after start date",
    "details": {
      "startDate": "2024-12-31",
      "endDate": "2024-01-01"
    }
  },
  "meta": {
    "timestamp": "2024-09-26T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Authentication required
- `INVALID_DATE_RANGE`: Date parameters are invalid
- `CAMPAIGN_NOT_FOUND`: Specified campaign doesn't exist
- `DATABASE_ERROR`: Sequelize or MySQL error
- `EXPORT_FAILED`: Data export generation failed

### Caching Strategy

**API Response Caching:**
- **Analytics data:** 5-minute cache for aggregate metrics
- **Filter data:** 1-hour cache for dropdowns
- **Export generation:** No caching (always fresh data)
- **Cache invalidation:** Manual cache clearing via admin endpoints

### Rate Limiting

**Limits per API category:**
- **Analytics endpoints:** 100 requests/minute per session
- **Export endpoints:** 10 requests/minute per session
- **Filter endpoints:** 200 requests/minute per session

## Frontend Architecture

This section outlines the Next.js App Router frontend architecture, component structure, and client-side patterns that deliver the exact FundraisUP interface replication with optimal performance for cPanel hosting.

### Next.js App Router Structure

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

### Component Architecture

#### Component Hierarchy
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

#### Core Components

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

### State Management with Zustand

#### Filter Store
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

#### Chart Data Cache Store
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

### Custom Hooks

#### Dashboard Data Fetching Hook
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

### Responsive Design System

#### Tailwind Configuration for FundraisUP Replication
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

#### Responsive Chart Grid
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

### Performance Optimization

#### Server Component Data Prefetching
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

#### Progressive Enhancement Pattern
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

### Error Boundaries and Loading States

#### Chart Error Boundary
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
