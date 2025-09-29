/**
 * Performance monitoring utilities
 */

interface PerformanceMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private markers = new Map<string, PerformanceMarker>();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
  }

  /**
   * Start timing an operation
   */
  public mark(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.markers.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });

    // Also use native performance marks if available
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End timing an operation
   */
  public measure(name: string): number | null {
    if (!this.isEnabled) return null;

    const marker = this.markers.get(name);
    if (!marker) return null;

    const endTime = performance.now();
    const duration = endTime - marker.startTime;

    marker.endTime = endTime;
    marker.duration = duration;

    // Use native performance measure if available
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⏱️ ${name}: ${duration.toFixed(2)}ms`, marker.metadata || '');
    }

    return duration;
  }

  /**
   * Get all performance markers
   */
  public getMarkers(): PerformanceMarker[] {
    return Array.from(this.markers.values());
  }

  /**
   * Clear all markers
   */
  public clear() {
    this.markers.clear();
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  /**
   * Get memory usage information
   */
  public getMemoryInfo() {
    if (!this.isEnabled || !('memory' in performance)) return null;

    const memory = (performance as any).memory;
    return {
      usedJSSize: memory.usedJSSize,
      totalJSSize: memory.totalJSSize,
      jsLimit: memory.jsLimit
    };
  }

  /**
   * Monitor a function's performance
   */
  public async monitor<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<{ result: T; duration: number }> {
    this.mark(name, metadata);

    try {
      const result = await fn();
      const duration = this.measure(name) || 0;
      return { result, duration };
    } catch (error) {
      this.measure(name);
      throw error;
    }
  }

  /**
   * Get resource loading performance
   */
  public getResourceMetrics() {
    if (!this.isEnabled) return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: this.getResourceType(resource.name),
      startTime: resource.startTime,
      fetchStart: resource.fetchStart,
      responseEnd: resource.responseEnd
    }));
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  /**
   * Get navigation timing info
   */
  public getNavigationMetrics() {
    if (!this.isEnabled) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export convenient functions
export const markStart = (name: string, metadata?: Record<string, any>) => {
  performanceMonitor.mark(name, metadata);
};

export const markEnd = (name: string): number | null => {
  return performanceMonitor.measure(name);
};

export const monitorAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<{ result: T; duration: number }> => {
  return performanceMonitor.monitor(name, fn, metadata);
};

export const getPerformanceReport = () => {
  return {
    markers: performanceMonitor.getMarkers(),
    memory: performanceMonitor.getMemoryInfo(),
    resources: performanceMonitor.getResourceMetrics(),
    navigation: performanceMonitor.getNavigationMetrics()
  };
};

export const clearPerformanceData = () => {
  performanceMonitor.clear();
};

export default performanceMonitor;