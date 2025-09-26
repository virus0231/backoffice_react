# Coding Standards

This document defines the coding standards and conventions for the Nonprofit Fundraising Analytics Dashboard project. These standards ensure consistency, maintainability, and quality across the codebase.

## Language Standards

### TypeScript
- **Strict Mode**: All TypeScript files must use strict mode (`"strict": true` in tsconfig.json)
- **Type Safety**: Prefer explicit types over `any`. Use `unknown` when type is truly unknown
- **Interface Naming**: Use PascalCase for interfaces (e.g., `DonationData`, `ChartConfig`)
- **Type Definitions**: Define types in separate `.types.ts` files when shared across components

### JavaScript/Node.js
- **ES6+ Features**: Use modern JavaScript features (async/await, destructuring, arrow functions)
- **Modules**: Use ES6 import/export syntax consistently
- **Promise Handling**: Prefer async/await over Promise chains

## Framework Standards

### Next.js App Router
- **Page Components**: Export default function components for pages
- **Server Components**: Use Server Components by default, mark Client Components with `'use client'`
- **File Naming**: Use kebab-case for file names (`donation-chart.tsx`, `filter-system.tsx`)
- **Route Groups**: Use parentheses for route groups that don't affect URL structure

### React Components
- **Component Naming**: Use PascalCase for component names
- **Functional Components**: Prefer function components over class components
- **Props Interface**: Define props interfaces with descriptive names ending in `Props`
- **Component Structure**:
  ```typescript
  interface ComponentNameProps {
    // Props definition
  }

  export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
    // Component logic
    return (
      // JSX
    );
  }
  ```

## Styling Standards

### Tailwind CSS
- **Utility Classes**: Prefer Tailwind utilities over custom CSS
- **Responsive Design**: Use responsive prefixes (`sm:`, `md:`, `lg:`)
- **Custom Classes**: Define custom classes in `globals.css` for repeated patterns
- **Color Consistency**: Use defined color palette from Tailwind config

### Component Styling
- **Conditional Classes**: Use `clsx` or similar for conditional class application
- **CSS Modules**: Use for component-specific styles when Tailwind isn't sufficient
- **No Inline Styles**: Avoid inline styles except for dynamic values

## Database & API Standards

### Sequelize Models
- **Model Naming**: Use PascalCase for model names (e.g., `Donation`, `Campaign`)
- **Field Naming**: Use camelCase for field names matching database columns
- **Associations**: Define associations in model files
- **Validation**: Include model-level validations where appropriate

### API Routes
- **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- **Response Format**: Standardize API responses:
  ```typescript
  {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
  }
  ```
- **Error Handling**: Consistent error handling with appropriate HTTP status codes
- **Input Validation**: Validate all API inputs using Zod or similar

## Code Organization

### File Structure
- **Components**: Organize by feature, not type (`/components/charts/`, `/components/filters/`)
- **Utilities**: Place utility functions in `/lib/` directory
- **Types**: Shared types in `/types/` directory
- **Hooks**: Custom hooks in `/hooks/` directory

### Import Organization
1. React and Next.js imports
2. Third-party library imports
3. Internal imports (components, utilities, types)
4. Relative imports

```typescript
import React from 'react';
import { NextRequest } from 'next/server';

import { Recharts } from 'recharts';
import { clsx } from 'clsx';

import { DonationService } from '@/lib/services/donation';
import { ChartConfig } from '@/types/charts';

import './component.css';
```

## Performance Standards

### Component Optimization
- **Memoization**: Use `React.memo()` for components that render frequently
- **useCallback**: Wrap event handlers in `useCallback` when passed to child components
- **useMemo**: Use for expensive calculations or object creation
- **Dynamic Imports**: Use `dynamic()` from Next.js for code splitting

### Bundle Optimization
- **Tree Shaking**: Import only needed functions from libraries
- **Image Optimization**: Use Next.js `Image` component for all images
- **Font Loading**: Use Next.js font optimization for custom fonts

## Testing Standards

### Unit Tests
- **File Naming**: Test files end with `.test.ts` or `.test.tsx`
- **Test Organization**: Group related tests with `describe()` blocks
- **Test Naming**: Use descriptive test names that explain the scenario
- **Assertions**: Use specific assertions (`toEqual`, `toHaveLength`) over generic ones

### Integration Tests
- **API Testing**: Test API routes with real database operations (using test database)
- **Component Testing**: Test component integration with React Testing Library
- **E2E Testing**: Use Playwright for critical user flows

## Security Standards

### Data Handling
- **Input Sanitization**: Sanitize all user inputs before database operations
- **SQL Injection Prevention**: Use Sequelize parameterized queries
- **Environment Variables**: Never commit secrets or API keys
- **CORS**: Configure CORS appropriately for API routes

### Authentication
- **Session Management**: Use NextAuth.js for session handling
- **Route Protection**: Protect API routes and pages requiring authentication
- **Role-Based Access**: Implement appropriate access controls

## Error Handling

### Client-Side Errors
- **Error Boundaries**: Implement error boundaries for component error handling
- **Loading States**: Provide loading states for all async operations
- **User Feedback**: Show meaningful error messages to users

### Server-Side Errors
- **Logging**: Use Winston for structured error logging
- **Error Responses**: Return consistent error response format
- **Database Errors**: Handle database connection and query errors gracefully

## Documentation Standards

### Code Comments
- **JSDoc**: Use JSDoc for function and component documentation
- **Inline Comments**: Explain complex business logic or calculations
- **TODO Comments**: Use consistent format: `// TODO: Description`

### README Updates
- **Setup Instructions**: Keep setup instructions current
- **Environment Variables**: Document all required environment variables
- **Deployment Notes**: Include deployment-specific instructions

## Git Standards

### Commit Messages
- **Format**: Use conventional commit format: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Description**: Clear, concise description of changes

### Branch Naming
- **Format**: `type/short-description` (e.g., `feat/donation-filtering`, `fix/chart-rendering`)
- **Pull Requests**: Include description of changes and testing performed

## Performance Monitoring

### Metrics
- **Core Web Vitals**: Monitor LCP, FID, and CLS
- **API Response Times**: Log and monitor API endpoint performance
- **Database Query Performance**: Monitor slow queries and optimize

### Optimization
- **Bundle Analysis**: Regularly analyze bundle size
- **Database Indexing**: Ensure proper database indexes for query performance
- **Caching Strategy**: Implement appropriate caching for frequently accessed data