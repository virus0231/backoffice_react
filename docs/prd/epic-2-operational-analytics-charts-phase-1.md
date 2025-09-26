# Epic 2: Operational Analytics Charts (Phase 1)

**Epic Goal:** Implement essential operational analytics charts (donations count, donor retention, first-time donor acquisition) with full comparison functionality and data tables, establishing the core analytical capabilities that provide operational insights for daily fundraising management. Note: Recurring revenue analytics moved to Phase 2 Epic 5 for advanced implementation.

## Story 2.1: Donations Count Analytics Chart

As a **fundraising coordinator**,
I want **a time-series chart showing daily donation count trends with comparison overlay**,
so that **I can track donation volume patterns and identify peak giving periods**.

### Acceptance Criteria
1. Recharts line chart displaying donation count over selected time period
2. Comparison period overlay with percentage change indicators (green/red)
3. Responsive chart scaling with appropriate Y-axis ranges
4. Hover tooltips showing exact counts and dates
5. Associated data table below chart with sortable columns showing detailed breakdown
6. Integration with universal filter system (date, appeals, funds, frequency)
7. Export functionality for chart visualization and underlying data

## Story 2.2: Donor Retention Analytics Chart

As a **development officer**,
I want **donor retention tracking showing repeat donor patterns over time**,
so that **I can identify retention trends and optimize donor stewardship strategies**.

### Acceptance Criteria
1. Recharts line chart showing donor retention rates by time period
2. Retention calculation logic (repeat donors / total unique donors from previous period)
3. Comparison overlay functionality with percentage change calculations
4. Data table showing retention metrics, new donors, and repeat donor counts
5. Filter integration supporting appeals and date range analysis
6. Tooltip displaying retention percentage and donor counts
7. Chart styling matching FundraisUP aesthetic with appropriate color coding

## Story 2.3: First Time Donors Acquisition Chart

As a **fundraising manager**,
I want **first-time donor acquisition tracking with trend analysis**,
so that **I can monitor new donor growth and evaluate acquisition campaign effectiveness**.

### Acceptance Criteria
1. Time-series chart displaying first-time donor counts over selected period
2. New donor identification logic preventing duplicate counting across time periods
3. Comparison period functionality showing acquisition trend changes
4. Data table with first-time donor metrics, conversion rates, and acquisition sources
5. Integration with appeals and frequency filters for campaign-specific analysis
6. Visual indicators for acquisition spikes and trend patterns
7. Export capabilities for new donor reporting and analysis

## Story 2.4: Operational Analytics Integration & Performance Optimization

As a **system user**,
I want **all core analytics charts loading simultaneously with optimal performance**,
so that **I can analyze multiple metrics concurrently without delays or system slowdowns**.

### Acceptance Criteria
1. Lazy loading implementation for chart components improving initial dashboard load
2. **Query collaboration system where development agent requests specific queries from user for each chart type**
3. **Agent optimization of user-provided queries for filtering, comparison periods, and performance**
4. Caching layer for frequently accessed analytics with appropriate TTL settings
5. Loading states and skeleton screens for all chart components
6. Error handling with user-friendly messages for data loading failures
7. Performance monitoring ensuring sub-3-second load times for all four charts
8. Responsive behavior maintaining chart readability across device sizes
