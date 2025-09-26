# Technical Assumptions

## Repository Structure: Monorepo
Single Next.js repository containing all components, API routes, and database integration logic organized in `/components/charts`, `/components/filters`, `/lib/database`, `/api/analytics` structure.

## Service Architecture
**Serverless Next.js architecture** with API routes handling database queries, separate endpoints for each chart type with shared filtering logic, and optimized connection pooling for phpMySQL integration.

## Testing Requirements
**Unit + Integration testing** focused on:
- Database query accuracy and performance validation
- Chart component rendering and data binding verification
- Filter logic and comparison period calculations testing
- Export functionality validation across all chart types

## Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- Next.js 13+ with App Router and React 18+ server components for optimal performance
- TypeScript for comprehensive type safety across all components and API routes
- Tailwind CSS for pixel-perfect replication of FundraisUP styling and responsive design
- **Recharts** for visualization components exactly matching FundraisUP appearance

**Database Integration Strategy:**
- Direct phpMySQL connection with optimized connection pooling and query caching
- **User-provided query collaboration system** where development agent requests specific queries from user for each chart type
- **Agent optimization of user-provided queries** for filtering, comparison periods, and performance
- Real-time data aggregation with non-overlapping date comparison calculations
- Performance optimization for 3GB+ database with indexed queries for date ranges and relationships

**State Management & Performance:**
- Zustand or Context API for filter states and comparison data coordination across all charts
- **Multi-level caching strategy** with Redis or in-memory caching for frequently accessed aggregated analytics data
- Lazy loading for chart components to optimize initial dashboard load times
- WebSocket or efficient polling for real-time data updates without full page refresh
