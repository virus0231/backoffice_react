# Coding Standards

## Overview
This document outlines the coding standards and best practices for the Insights project - a Next.js fundraising analytics dashboard with PHP API backend.

## General Principles

### Code Quality
- **Consistency**: Follow established patterns throughout the codebase
- **Readability**: Write self-documenting code with clear naming conventions
- **Maintainability**: Structure code for easy maintenance and updates
- **Performance**: Optimize for both development and production environments
- **Security**: Follow security best practices, especially for data handling

### Error Handling
- Use comprehensive error boundaries and try-catch blocks
- Implement proper error logging with context
- Provide meaningful error messages to users
- Use typed error classes (`APIError`, `ValidationError`, `NetworkError`)
- Always handle async operations with proper error handling

## TypeScript Standards

### Type Safety
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` when needed
- Use proper typing for React components and hooks
- Implement proper error typing

### Naming Conventions
```typescript
// Interfaces - PascalCase with descriptive names
interface RevenueDataPoint {
  date: string;
  amount: number;
  count: number;
}

// Components - PascalCase
export default function LoadingSpinner() {}

// Hooks - camelCase starting with 'use'
export function useRevenueData() {}

// Constants - UPPER_SNAKE_CASE
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// Functions - camelCase with descriptive names
function formatErrorForDisplay() {}
```

### File Organization
- One main export per file
- Group related interfaces at the top
- Order imports: external libraries, internal modules, relative imports
- Use path aliases (@/) for clean imports

## React Standards

### Component Structure
```typescript
'use client'; // Only when needed

import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLibrary } from 'external-lib';
import { InternalUtility } from '@/lib/utils';
import LocalComponent from './LocalComponent';

interface ComponentProps {
  // Props interface
}

export default function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Callbacks
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Hook Standards
- Use `useCallback` for functions passed as dependencies
- Include all dependencies in useEffect arrays
- Extract complex logic into custom hooks
- Handle loading and error states properly

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Use proper TypeScript typing for stores
- Implement proper error handling in stores

## API Integration Standards

### Error Handling
```typescript
try {
  const response = await safeFetch(url, options);
  const data = await parseAPIResponse(response);
  return data;
} catch (error) {
  logError(error, context);
  const { message, isRetriable } = formatErrorForDisplay(error);
  // Handle error appropriately
}
```

### Caching Strategy
- Use `cachedFetch` for API calls with appropriate TTL
- Static data (appeals): 10 minutes TTL
- Dynamic data (analytics): 5 minutes TTL
- Enable deduplication for identical requests
- Use localStorage for persistence

### Request Patterns
```typescript
// Use cached fetch with proper configuration
const data = await cachedFetch(url, {}, {
  ttl: 5 * 60 * 1000, // 5 minutes
  useLocalStorage: true,
  dedupe: true
});
```

## Component Standards

### Loading States
- Always implement loading states for async operations
- Use consistent loading components (`LoadingSpinner`, `LoadingState`)
- Show loading immediately when operation starts
- Provide context-appropriate loading messages

### Error Boundaries
- Wrap components in `ErrorBoundary`
- Provide appropriate fallback UI
- Log errors for monitoring
- Allow recovery actions where possible

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios

## Styling Standards

### Tailwind CSS
- Use utility classes consistently
- Follow mobile-first responsive design
- Use design system colors and spacing
- Group related classes logically

### Class Organization
```typescript
className={clsx(
  // Base styles
  'flex items-center justify-between',
  // State-dependent styles
  isActive && 'bg-blue-50 text-blue-900',
  // Responsive styles
  'md:text-lg lg:text-xl',
  // Conditional props
  className
)}
```

### Design System
- Use predefined color palette (primary, success, warning, danger, gray)
- Follow spacing scale (4px base unit)
- Use consistent border radius and shadows
- Maintain consistent typography scale

## Performance Standards

### Bundle Optimization
- Use dynamic imports for large components
- Implement proper tree shaking
- Minimize bundle size with webpack optimization
- Use appropriate caching strategies

### Runtime Performance
- Use React.memo for expensive components
- Implement proper dependency arrays
- Avoid unnecessary re-renders
- Monitor performance with built-in tools

### Caching
- Implement multi-layer caching (memory + localStorage)
- Use appropriate cache invalidation
- Monitor cache hit rates
- Clean up expired cache entries

## Security Standards

### Data Handling
- Sanitize all user inputs
- Validate data at boundaries
- Use proper CORS configuration
- Implement CSRF protection

### Environment Variables
- Never commit secrets to version control
- Use `.env.example` for documentation
- Validate required environment variables
- Use different configurations for environments

### Headers and Security
```javascript
// Security headers in next.config.js
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  }
]
```

## Testing Standards

### Not Implemented
- Testing infrastructure has been removed as per project requirements
- Manual testing should cover all user flows
- Use browser dev tools for debugging
- Test across different browsers and devices

## Monitoring and Analytics

### Error Tracking
- Use built-in analytics system for production
- Log errors with proper context
- Track user interactions and performance
- Monitor API response times

### Performance Monitoring
```typescript
// Track performance of operations
const { result, duration } = await monitorAsync('api_call', async () => {
  return await apiCall();
});
```

## File Naming Conventions

### Components
- PascalCase: `LoadingSpinner.tsx`
- Include component type: `ChartErrorFallback.tsx`
- Group related components in directories

### Utilities
- camelCase: `errorHandling.ts`
- Descriptive names: `comparisonOverlay.ts`
- Group by functionality

### Types
- Match component names: `filters.ts` for filter-related types
- Use descriptive interfaces: `RevenueDataPoint`

## Git Commit Standards

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues when applicable
- Use conventional commit format when possible

### Branch Naming
- Feature branches: `feature/add-caching-system`
- Bug fixes: `fix/resolve-loading-state`
- Documentation: `docs/update-coding-standards`

## Code Review Checklist

### Before Submitting
- [ ] TypeScript compilation passes
- [ ] ESLint warnings addressed
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Proper error handling
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Documentation updated

### Review Criteria
- [ ] Code follows established patterns
- [ ] Error handling is comprehensive
- [ ] Types are properly defined
- [ ] Performance is considered
- [ ] Security is maintained
- [ ] Accessibility is preserved

## Common Patterns to Follow

### Custom Hook Pattern
```typescript
export function useDataFetching<T>(url: string, options?: CacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cachedFetch<T>(url, {}, options);
      setData(result);
    } catch (err) {
      logError(err, `Error fetching ${url}`);
      const { message } = formatErrorForDisplay(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry: fetchData };
}
```

### Error Handling Pattern
```typescript
// Always use the established error handling utilities
try {
  const response = await safeFetch(url);
  const data = await parseAPIResponse<T>(response);
  return data;
} catch (error) {
  logError(error, 'Operation context');
  const { message, isRetriable } = formatErrorForDisplay(error);
  // Handle based on whether error is retriable
  if (isRetriable) {
    // Show retry option
  } else {
    // Show permanent error state
  }
}
```

This document should be referenced for all development work and updated as patterns evolve.