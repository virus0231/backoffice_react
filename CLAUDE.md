# Claude AI Assistant Configuration for Insights Project

## Project Overview
Insights is a Next.js fundraising analytics dashboard with a PHP API backend, optimized for cPanel hosting. This configuration file helps Claude understand the project structure, standards, and architecture.

## Required Reading
**Claude should read these files before providing assistance:**

1. **`docs/architecture/coding-standards.md`** - Coding standards, patterns, and best practices
2. **`docs/architecture/tech-stack.md`** - Technology stack, architecture decisions, and deployment setup
3. **`docs/architecture/source-tree.md`** - Source code organization and file structure

## Project Context

### Architecture
- **Frontend**: Next.js 15.5.4 with React 19, TypeScript 5.9.2, Tailwind CSS 4.1.13
- **Backend**: PHP 8.x API with MySQL database
- **State Management**: Zustand 5.0.8 with persistence
- **Data Visualization**: Recharts 3.2.1
- **Hosting**: Optimized for cPanel with static builds

### Key Features
- Comprehensive error handling with custom error classes
- Multi-layer caching (memory + localStorage)
- Real-time analytics and performance monitoring
- Advanced filtering system with cascading dependencies
- Responsive design with custom Tailwind theme
- Bundle optimization for production deployment

### Development Standards
- Strict TypeScript with comprehensive error handling
- React patterns with proper hook dependencies
- Comprehensive loading states and error boundaries
- Security-first approach with input sanitization
- Performance optimization with caching strategies

## File Locations

### Configuration Files
- `next.config.js` - Next.js configuration with cPanel optimizations
- `tailwind.config.js` - Custom design system and theme
- `tsconfig.json` - Strict TypeScript configuration
- `package.json` - Dependencies and build scripts
- `.env.example` - Environment variable template

### Key Source Files
- `src/lib/utils/errorHandling.ts` - Comprehensive error handling system
- `src/lib/cache/apiCache.ts` - Multi-layer caching implementation
- `src/lib/monitoring/analytics.ts` - Production analytics system
- `src/stores/filterStore.ts` - Global state management
- `src/hooks/useRevenueData.ts` - Data fetching with caching

### Component Structure
- `src/components/common/` - Reusable UI components
- `src/components/filters/` - Advanced filtering system
- `src/components/charts/` - Data visualization components
- `src/components/dashboard/` - Dashboard-specific components

### API Integration
- `src/lib/config/phpApi.ts` - API URL building and configuration
- `php-api/` - Backend PHP API with proper error handling

## Development Guidelines

### Code Quality Requirements
1. **Error Handling**: Always use the established error handling patterns
2. **Loading States**: Implement loading states for all async operations
3. **TypeScript**: Maintain strict typing throughout
4. **Caching**: Use `cachedFetch` for API calls with appropriate TTL
5. **Performance**: Consider bundle size and runtime performance
6. **Security**: Validate and sanitize all inputs

### Common Tasks
- Adding new API endpoints requires updating both PHP backend and TypeScript interfaces
- New components should follow the established patterns in `/components/common/`
- State updates should use Zustand store with proper error handling
- All async operations should include comprehensive error handling

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build for cPanel
npm run type-check   # TypeScript compilation check
npm run lint         # Code quality and standards check
npm run analyze      # Bundle size analysis
```

### Deployment Notes
- Frontend builds to static files for cPanel deployment
- PHP API files deployed directly to cPanel
- Environment variables configured through cPanel
- Database connections optimized for shared hosting

## Assistant Instructions

### Before Providing Code Assistance
1. Read the three architecture documentation files
2. Understand the current error handling patterns
3. Check existing similar implementations
4. Follow established naming conventions
5. Consider performance and caching implications

### When Writing Code
- Use established error handling patterns from `errorHandling.ts`
- Implement proper loading states using common components
- Follow TypeScript strict mode requirements
- Use the caching system for API calls
- Include proper error boundaries for components

### When Reviewing Code
- Verify error handling is comprehensive
- Check TypeScript types are properly defined
- Ensure loading states are implemented
- Validate security considerations
- Review performance implications

### Common Patterns to Reference
- Error handling: `src/lib/utils/errorHandling.ts`
- Caching: `src/lib/cache/apiCache.ts`
- State management: `src/stores/filterStore.ts`
- API integration: `src/hooks/useRevenueData.ts`
- Component structure: `src/components/common/`

## Project Status
The project has undergone comprehensive improvements including:
- ✅ Fixed all ESLint warnings and TypeScript errors
- ✅ Implemented comprehensive error handling
- ✅ Added loading states for all async operations
- ✅ Created error boundaries for better UX
- ✅ Implemented multi-layer caching strategy
- ✅ Added production monitoring and analytics
- ✅ Optimized bundle size and performance
- ✅ Broke down large components into smaller pieces
- ✅ Removed test-related files and dependencies

The codebase now follows best practices for production deployment on cPanel hosting with comprehensive error handling, performance optimization, and maintainable architecture.

## Important Notes

### cPanel Hosting Considerations
- Static build output optimized for shared hosting
- PHP API designed for cPanel environment
- Database connections configured for shared MySQL
- Image optimization disabled for compatibility
- Bundle optimization enabled for faster loading

### Security Measures
- Comprehensive input validation and sanitization
- Proper CORS configuration
- Security headers in Next.js configuration
- Environment variable protection
- SQL injection prevention in PHP API

This configuration ensures Claude can provide accurate, consistent assistance that follows the project's established patterns and standards.