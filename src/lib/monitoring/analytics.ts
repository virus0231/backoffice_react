/**
 * Analytics and monitoring system for production deployment
 * Lightweight client-side analytics without external dependencies
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: string;
  sessionId: string;
  userAgent: string;
  url: string;
  referrer: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private queue: AnalyticsEvent[] = [];
  private isEnabled: boolean;
  private endpoint: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';

    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private initializeTracking() {
    // Track page views
    this.trackPageView();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track user interactions
    this.setupEventListeners();

    // Send queued events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
    });

    // Send events periodically
    setInterval(() => {
      this.flushQueue();
    }, 30000); // Every 30 seconds
  }

  private setupEventListeners() {
    // Track clicks on buttons and links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.track('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.slice(0, 100) || '',
          className: target.className,
          id: target.id
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      this.track('form_submit', {
        formId: target.id,
        formAction: target.action
      });
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown error'
      });
    });
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };

    this.queue.push(analyticsEvent);

    // Send immediately for important events
    if (['error', 'form_submit', 'page_view'].includes(event)) {
      this.flushQueue();
    }
  }

  public trackPageView(path?: string) {
    this.track('page_view', {
      path: path || window.location.pathname,
      title: document.title,
      loadTime: Date.now()
    });
  }

  public trackError(errorType: string, errorDetails: Record<string, any>) {
    this.track('error', {
      errorType,
      ...errorDetails,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  private trackPerformanceMetrics() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const metrics: PerformanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        };

        // Add paint timings if available
        paint.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });

        // Get Web Vitals if available
        if ('web-vitals' in window) {
          this.trackWebVitals();
        }

        this.track('performance_metrics', metrics);
      }, 1000);
    });
  }

  private trackWebVitals() {
    // This would integrate with web-vitals library if available
    // For now, we'll use basic performance API
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.track('web_vital', {
              metric: 'LCP',
              value: entry.startTime
            });
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Send CLS value after 5 seconds
      setTimeout(() => {
        this.track('web_vital', {
          metric: 'CLS',
          value: clsValue
        });
      }, 5000);

    } catch (error) {
      // Performance Observer not supported
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public identify(userId: string, properties?: Record<string, any>) {
    this.setUserId(userId);
    this.track('identify', {
      userId,
      ...properties
    });
  }

  private async flushQueue() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.warn('📊 Analytics Events:', events.length);
        events.forEach(event => {
          console.warn(`${event.event}:`, event.properties);
        });
        return;
      }

      // In production, send to analytics endpoint
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          batch: true,
          timestamp: Date.now()
        })
      });

    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events on failure (up to a limit)
      if (this.queue.length < 100) {
        this.queue.unshift(...events);
      }
    }
  }

  public disable() {
    this.isEnabled = false;
    this.queue = [];
  }

  public enable() {
    this.isEnabled = process.env.NODE_ENV === 'production';
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export functions for easy use
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackPageView = (path?: string) => {
  analytics.trackPageView(path);
};

export const trackError = (errorType: string, errorDetails: Record<string, any>) => {
  analytics.trackError(errorType, errorDetails);
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  analytics.identify(userId, properties);
};

export const disableAnalytics = () => {
  analytics.disable();
};

export const enableAnalytics = () => {
  analytics.enable();
};

export default analytics;