# High Level Architecture

## Technical Summary

The Insights dashboard adopts a **full-stack Next.js architecture** with API routes handling MySQL database operations through Sequelize ORM, deployed as a Node.js application on cPanel hosting. The solution uses Next.js App Router with server-side rendering for optimal performance, while API routes in the `/api` directory handle all database connectivity and analytics query processing. Sequelize ORM provides MySQL integration with connection pooling optimized for cPanel's shared hosting environment. The architecture leverages Next.js's built-in caching capabilities combined with Zustand for client-side state management, ensuring sub-3-second load times for the priority chart visualizations through strategic server-side data fetching and client-side hydration.

## Platform and Infrastructure Choice

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

## Repository Structure

**Structure:** Single Next.js application with organized feature structure
**Package Organization:**
- `apps/web/` - Main Next.js dashboard application
- `packages/shared/` - TypeScript interfaces and utilities shared between frontend/backend
- `packages/database/` - Database connection utilities and query builders

## High Level Architecture Diagram

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

## Architectural Patterns

**Core patterns for Next.js-only architecture:**

- **App Router Pattern:** Server components for data fetching + client components for interactivity - _Rationale:_ Optimal performance with server-side rendering and client-side hydration
- **API Routes Pattern:** Next.js `/api` directory for all backend functionality - _Rationale:_ Single codebase deployment with built-in API capabilities
- **Server Component Data Fetching:** Initial chart data loaded server-side - _Rationale:_ Faster initial page loads and better SEO performance
- **Client-Side State Management:** Zustand for filter state and real-time updates - _Rationale:_ Reactive UI updates without full page reloads
- **Sequelize Repository Pattern:** Database models abstract data access - _Rationale:_ Type-safe database operations with connection pooling
- **Progressive Enhancement:** Server-rendered baseline with client-side interactivity - _Rationale:_ Works without JavaScript but enhanced with it
