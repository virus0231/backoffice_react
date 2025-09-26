# Tech Stack

This is the **DEFINITIVE technology selection** for your entire project. Based on your constraints (cPanel hosting, Next.js only, Sequelize required), here's the comprehensive tech stack:

## Technology Stack Table

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
