# Epic 1: Foundation & Core Infrastructure

**Epic Goal:** Establish complete Next.js project foundation with phpMySQL database connectivity, universal filtering system, and the primary three-section revenue dashboard that replicates FundraisUP's main analytics interface while providing the technical infrastructure for all subsequent chart implementations.

## Story 1.1: Project Setup & Architecture Foundation

As a **development team**,
I want **a complete Next.js 13+ project with TypeScript, Tailwind CSS, and Recharts configured**,
so that **I have optimized development environment ready for FundraisUP dashboard replication**.

### Acceptance Criteria
1. Next.js 13+ project initialized with App Router and TypeScript configuration
2. Tailwind CSS configured with custom theme matching FundraisUP color schemes and spacing
3. Recharts library installed and configured with custom theme setup
4. Project structure established: `/components/charts`, `/components/filters`, `/lib/database`, `/api/analytics`
5. ESLint and Prettier configured for consistent code quality
6. Basic responsive layout structure matching FundraisUP's scrollable multi-panel design

## Story 1.2: Database Connection & Query Foundation

As a **development team**,
I want **secure phpMySQL database connectivity with connection pooling and basic query structure**,
so that **all dashboard charts can efficiently access fundraising data without performance bottlenecks**.

### Acceptance Criteria
1. Database connection configuration with environment variable management
2. Connection pooling implementation supporting multiple simultaneous queries
3. Basic database utility functions for parameterized queries with filtering support
4. Error handling and logging for database connection issues
5. Query performance monitoring and timeout configuration
6. Test connection endpoint confirming database accessibility and basic data retrieval

## Story 1.3: Universal Filter System Implementation

As a **fundraising analyst**,
I want **comprehensive filtering controls that affect all dashboard charts simultaneously**,
so that **I can analyze specific time periods, campaigns, and donation types across the entire dashboard**.

### Acceptance Criteria
1. Date range picker with preset options (Today, Yesterday, Last 7/14/30 days, This week/month/year)
2. Appeals dropdown populated from database with dynamic options
3. Funds dropdown with cascading logic based on selected appeals
4. Frequency filter with options: All donations, One-time, Recurring, Recurring (first installments), Recurring (next installments)
5. Filter state management using Zustand with persistence across page refreshes
6. Filter validation preventing invalid date ranges and ensuring logical combinations
7. Global filter context available to all chart components

## Story 1.4: Comparison Period System

As a **fundraising analyst**,
I want **individual chart comparison capabilities with smart date validation**,
so that **I can overlay different time periods on each chart to identify trends and performance changes**.

### Acceptance Criteria
1. Individual comparison toggle for each chart with calendar picker interface
2. Smart date validation preventing overlapping periods with main date range
3. Comparison state management integrated with global filter system
4. Visual indicators showing comparison period selection and status
5. Percentage change calculations between current and comparison periods
6. Comparison data state shared across chart components and data tables

## Story 1.5: Primary Revenue Dashboard (Three-Section Chart)

As a **development director**,
I want **the main revenue dashboard with three distinct sections showing total raised, first installments, and one-time donations**,
so that **I can immediately understand our fundraising performance breakdown and identify revenue sources**.

### Acceptance Criteria
1. "Raised" section with total revenue amount and donation count display matching FundraisUP styling
2. "First Installments" section showing new recurring donor revenue with count metrics
3. "One-time donations" section displaying single gift revenue and transaction count
4. Three synchronized Recharts area charts with blue gradient fills matching reference design
5. Shared date filtering and comparison overlay functionality across all three sections
6. Daily/Weekly view toggle affecting all three charts simultaneously
7. Responsive layout maintaining three-section structure on different screen sizes
8. Real-time data updates reflecting current filter selections
