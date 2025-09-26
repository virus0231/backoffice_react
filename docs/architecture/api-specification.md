# API Specification

This section defines the RESTful API endpoints that power the analytics dashboard. All APIs are implemented as Next.js API routes in the `/api` directory, providing JSON responses for chart data, filtering options, and data export functionality.

## API Overview

The API follows RESTful conventions with these key patterns:
- **Base URL:** `/api/v1/`
- **Content Type:** `application/json`
- **Authentication:** NextAuth.js session-based
- **Error Format:** Consistent error response structure
- **Caching:** Response caching for performance optimization

## Core API Endpoints

### Analytics Data Endpoints

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

### Campaign and Fund Analytics

**GET `/api/v1/analytics/campaigns`**
- **Purpose:** Campaign performance with goal tracking
- **Parameters:**
  - `status`: "active", "completed", "all"
  - `sortBy`: "totalRaised", "goalProgress", "donorCount"
  - `limit`: number (default: 10)

**GET `/api/v1/analytics/funds`**
- **Purpose:** Fund allocation and performance analysis
- **Parameters:** Similar to campaigns endpoint

### Filter Data Endpoints

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

### Export Endpoints

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

## API Implementation Pattern

### Base API Route Structure
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

## Error Handling

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

## Caching Strategy

**API Response Caching:**
- **Analytics data:** 5-minute cache for aggregate metrics
- **Filter data:** 1-hour cache for dropdowns
- **Export generation:** No caching (always fresh data)
- **Cache invalidation:** Manual cache clearing via admin endpoints

## Rate Limiting

**Limits per API category:**
- **Analytics endpoints:** 100 requests/minute per session
- **Export endpoints:** 10 requests/minute per session
- **Filter endpoints:** 200 requests/minute per session
