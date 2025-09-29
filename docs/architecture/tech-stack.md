# Technology Stack

## Overview
Insights is a fundraising analytics dashboard built for cPanel hosting with static builds. The architecture separates the frontend (Next.js) from the backend (PHP API) to optimize for shared hosting environments.

## Frontend Architecture

### Core Framework
**Next.js 15.5.4**
- **App Router**: Using the new app directory structure
- **Static Export**: Configured for cPanel hosting with `output: 'standalone'`
- **React 19**: Latest React version with improved performance
- **TypeScript 5.9.2**: Full type safety throughout the application

#### Why Next.js?
- Server-side rendering capabilities
- Built-in optimization features
- Excellent developer experience
- Strong TypeScript support
- Easy deployment to static hosting

### State Management
**Zustand 5.0.8**
- Lightweight state management
- TypeScript-first approach
- Minimal boilerplate
- Built-in persistence layer

#### State Structure
```typescript
interface FilterStore extends FilterState {
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Validation
  lastValidationError: string | null;
  setValidationError: (error: string | null) => void;

  // Filter actions
  setDateRange: (range: DateRange) => void;
  setAppeals: (appeals: Appeal[]) => void;
  setFunds: (funds: Fund[]) => void;
}
```

### UI Framework
**Tailwind CSS 4.1.13**
- Utility-first CSS framework
- Custom design system with brand colors
- Responsive design utilities
- Component-based styling approach
- Build-time CSS optimization

#### Design System
- **Primary Colors**: Blue gradients (#3b82f6 family)
- **Success Colors**: Green indicators (#22c55e family)
- **Warning Colors**: Orange alerts (#f59e0b family)
- **Danger Colors**: Red indicators (#ef4444 family)
- **Neutral Colors**: Gray scale for backgrounds and text

### Data Visualization
**Recharts 3.2.1**
- React-based charting library
- Responsive charts
- TypeScript support
- Customizable components

#### Chart Types Implemented
- Area charts with comparison overlays
- Bar charts (horizontal and vertical)
- Donut charts for distributions
- Heatmap grids for time-based data

### Date Handling
**date-fns 4.1.0**
- Modern date manipulation library
- Tree-shakeable imports
- TypeScript support
- Comprehensive date utilities

### Utility Libraries
**clsx 2.1.1**
- Conditional className utility
- Small bundle size
- TypeScript support

## Backend Architecture

### API Framework
**PHP 8.x**
- RESTful API design
- JSON response format
- Error handling with standardized responses
- CORS configuration for frontend integration

#### API Structure
```php
// Standard API response format
{
  "success": boolean,
  "data": any,
  "message": string,
  "count": number
}
```

### Database
**MySQL/phpMySQL**
- Optimized for cPanel hosting
- Connection pooling configuration
- Query timeout settings
- Proper indexing for analytics queries

#### Database Models (Referenced but removed)
- PwDonors - Donor information
- PwFundlist - Fund categories
- PwSchedule - Recurring donations
- PwStripeSchedule - Payment schedules
- PwTransactionDetails - Transaction details
- PwTransactions - Main transaction records

## Development Tools

### Code Quality
**ESLint 9.36.0**
- Next.js configuration
- Prettier integration
- Custom rules for React hooks
- TypeScript-aware linting

**Prettier 3.6.2**
- Code formatting
- Consistent style enforcement
- Integration with ESLint

### Build Tools
**PostCSS 8.5.6**
- CSS processing
- Tailwind integration
- Autoprefixer for browser compatibility

**Autoprefixer 10.4.21**
- Automatic vendor prefixes
- Browser compatibility layer

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true
  }
}
```

## Performance Architecture

### Caching Strategy
**Multi-layer Caching**
1. **Memory Cache**: Fast in-memory storage for active data
2. **localStorage**: Browser persistence for offline capability
3. **API Cache**: Request deduplication and response caching

#### Cache Configuration
```typescript
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useLocalStorage?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupe?: boolean; // Deduplicate identical requests
}
```

#### Cache TTL Strategy
- **Static Data (Appeals)**: 10 minutes
- **Analytics Data**: 5 minutes
- **Funds Data**: 5 minutes
- **Comparison Data**: 5 minutes

### Error Handling
**Comprehensive Error System**
```typescript
// Error class hierarchy
APIError -> HTTP and API-specific errors
NetworkError -> Connection and timeout errors
ValidationError -> Input validation errors
```

### Monitoring
**Built-in Analytics System**
- Client-side event tracking
- Performance metrics collection
- Error reporting
- User interaction analytics

## Deployment Architecture

### Frontend Deployment
**Static Export for cPanel**
- Built as static files
- No server-side rendering requirements
- Optimized bundle splitting
- Asset compression and optimization

### Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  images: { unoptimized: true },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true
};
```

### Backend Deployment
**PHP on cPanel**
- Direct file deployment
- Environment-based configuration
- Database connection pooling
- Error logging and monitoring

## Security Architecture

### Frontend Security
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookie configuration
- **Data Sanitization**: Input validation and sanitization
- **Secure Headers**: X-Frame-Options, X-Content-Type-Options

### API Security
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Prevention**: Prepared statements
- **Authentication**: Session-based authentication (when implemented)
- **CORS Configuration**: Restricted origins and methods

### Environment Security
```env
# Database configuration
DB_HOST=your_cpanel_mysql_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Application settings
NODE_ENV=production
NEXTAUTH_SECRET=your_secret_here
```

## File Structure Integration

### Asset Management
- **Static Assets**: Served directly from cPanel
- **Bundle Optimization**: Code splitting and tree shaking
- **Image Optimization**: Disabled for cPanel compatibility
- **Font Loading**: Google Fonts with swap display

### API Integration
```typescript
// API URL building
export function buildAnalyticsUrl(kind: string, params: URLSearchParams): string {
  const base = getPhpApiBase();
  const url = new URL(`${base}/analytics.php`);
  url.searchParams.set('kind', kind);
  return url.toString();
}
```

## Performance Considerations

### Bundle Size Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based and component-based splitting
- **Dynamic Imports**: Lazy loading of heavy components
- **Bundle Analysis**: Built-in webpack bundle analyzer

### Runtime Performance
- **React Optimization**: Proper use of useMemo and useCallback
- **State Management**: Efficient state updates with Zustand
- **API Optimization**: Request deduplication and caching
- **Database Optimization**: Indexed queries and connection pooling

### Loading Strategies
- **Progressive Loading**: Show UI immediately with loading states
- **Error Boundaries**: Graceful error handling without full page crashes
- **Retry Logic**: Automatic retry for transient errors
- **Offline Support**: localStorage caching for offline functionality

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run type-check   # TypeScript compilation check
npm run lint         # ESLint and code quality
npm run build        # Production build
npm run analyze      # Bundle size analysis
```

### Production Build
```bash
npm run build        # Creates optimized static export
# Deploy /out directory to cPanel public_html
```

### API Development
- PHP files deployed directly to cPanel
- Database configuration through environment variables
- Local development with XAMPP or similar PHP environment

## Browser Support

### Target Browsers
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Legacy Support**: Graceful degradation for older browsers

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features require modern browser support
- Responsive design for all screen sizes
- Touch-friendly interfaces for mobile devices

This technology stack provides a robust, scalable, and maintainable foundation for the Insights analytics dashboard while being optimized for cPanel hosting environments.