/**
 * Database Query Performance Monitor
 * Tracks query execution times, identifies slow queries, and collects performance metrics
 */

import { QueryTypes } from 'sequelize';
import { getSequelizeInstance } from './sequelize';
import { logger, logQuery, logSlowQuery } from './logger';
import { databaseHealthMonitor } from './healthMonitor';

// Performance threshold constants
const SLOW_QUERY_THRESHOLD = 1000; // 1 second
const VERY_SLOW_QUERY_THRESHOLD = 5000; // 5 seconds
const QUERY_TIMEOUT_DEFAULT = 30000; // 30 seconds

// Query performance metrics interface
export interface QueryPerformanceMetrics {
  queryHash: string;
  sql: string;
  executionTime: number;
  timestamp: string;
  parameters?: any;
  isSlowQuery: boolean;
  isVerySlowQuery: boolean;
}

// Performance statistics interface
export interface PerformanceStatistics {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  verySlowQueries: number;
  fastQueries: number;
  queryTimeoutErrors: number;
  percentileStats: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

class DatabasePerformanceMonitor {
  private queryHistory: QueryPerformanceMetrics[] = [];
  private statisticsCache: PerformanceStatistics | null = null;
  private lastStatisticsUpdate = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private readonly MAX_HISTORY_SIZE = 1000;

  /**
   * Records query execution and performance metrics
   */
  recordQueryExecution(
    sql: string,
    executionTime: number,
    parameters?: any,
    error?: Error
  ): void {
    const queryHash = this.generateQueryHash(sql);
    const timestamp = new Date().toISOString();

    const metrics: QueryPerformanceMetrics = {
      queryHash,
      sql: this.sanitizeSQL(sql),
      executionTime,
      timestamp,
      parameters,
      isSlowQuery: executionTime > SLOW_QUERY_THRESHOLD,
      isVerySlowQuery: executionTime > VERY_SLOW_QUERY_THRESHOLD
    };

    // Add to history
    this.queryHistory.push(metrics);

    // Maintain history size limit
    if (this.queryHistory.length > this.MAX_HISTORY_SIZE) {
      this.queryHistory.shift();
    }

    // Log query execution
    logQuery(sql, parameters, executionTime);

    // Log slow queries
    if (metrics.isSlowQuery) {
      logSlowQuery(sql, executionTime, SLOW_QUERY_THRESHOLD);
    }

    // Record in health monitor
    databaseHealthMonitor.recordQueryExecution(executionTime);

    // Log very slow queries as warnings
    if (metrics.isVerySlowQuery) {
      logger.warn('Very slow query detected', {
        queryHash,
        executionTime: `${executionTime}ms`,
        threshold: `${VERY_SLOW_QUERY_THRESHOLD}ms`,
        sql: this.sanitizeSQL(sql)
      });
    }

    // Log timeout errors
    if (error && this.isTimeoutError(error)) {
      logger.error('Query timeout error', {
        queryHash,
        executionTime: `${executionTime}ms`,
        timeout: `${QUERY_TIMEOUT_DEFAULT}ms`,
        error: error.message
      });
    }

    // Invalidate statistics cache
    this.statisticsCache = null;
  }

  /**
   * Gets performance statistics
   */
  getPerformanceStatistics(): PerformanceStatistics {
    const now = Date.now();

    // Return cached statistics if still valid
    if (
      this.statisticsCache &&
      now - this.lastStatisticsUpdate < this.CACHE_DURATION
    ) {
      return this.statisticsCache;
    }

    // Calculate fresh statistics
    const totalQueries = this.queryHistory.length;
    if (totalQueries === 0) {
      return this.getEmptyStatistics();
    }

    const executionTimes = this.queryHistory.map(q => q.executionTime).sort((a, b) => a - b);
    const totalExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0);

    const slowQueries = this.queryHistory.filter(q => q.isSlowQuery).length;
    const verySlowQueries = this.queryHistory.filter(q => q.isVerySlowQuery).length;
    const fastQueries = totalQueries - slowQueries;
    const queryTimeoutErrors = this.queryHistory.filter(q =>
      q.executionTime >= QUERY_TIMEOUT_DEFAULT
    ).length;

    const statistics: PerformanceStatistics = {
      totalQueries,
      averageExecutionTime: totalExecutionTime / totalQueries,
      slowQueries,
      verySlowQueries,
      fastQueries,
      queryTimeoutErrors,
      percentileStats: this.calculatePercentiles(executionTimes)
    };

    // Cache the results
    this.statisticsCache = statistics;
    this.lastStatisticsUpdate = now;

    return statistics;
  }

  /**
   * Gets slow query analysis
   */
  getSlowQueryAnalysis(limit = 10): QueryPerformanceMetrics[] {
    return this.queryHistory
      .filter(q => q.isSlowQuery)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  /**
   * Gets query performance trends
   */
  getPerformanceTrends(timeWindowMinutes = 60): {
    windowStart: string;
    windowEnd: string;
    queryCount: number;
    averageExecutionTime: number;
    slowQueryRate: number;
  } {
    const windowStart = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const windowEnd = new Date();

    const queriesInWindow = this.queryHistory.filter(q =>
      new Date(q.timestamp) >= windowStart
    );

    if (queriesInWindow.length === 0) {
      return {
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        queryCount: 0,
        averageExecutionTime: 0,
        slowQueryRate: 0
      };
    }

    const totalExecutionTime = queriesInWindow.reduce(
      (sum, q) => sum + q.executionTime,
      0
    );
    const slowQueries = queriesInWindow.filter(q => q.isSlowQuery).length;

    return {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      queryCount: queriesInWindow.length,
      averageExecutionTime: totalExecutionTime / queriesInWindow.length,
      slowQueryRate: (slowQueries / queriesInWindow.length) * 100
    };
  }

  /**
   * Wraps Sequelize query execution with performance monitoring
   */
  async monitorQuery<T>(
    queryFunction: () => Promise<T>,
    sql: string,
    parameters?: any
  ): Promise<T> {
    const startTime = Date.now();
    let result: T;
    let error: Error | undefined;

    try {
      result = await queryFunction();
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      this.recordQueryExecution(sql, executionTime, parameters, error);
    }

    return result;
  }

  /**
   * Creates a monitored version of a Sequelize query method
   */
  createMonitoredQuery() {
    const sequelize = getSequelizeInstance();

    return {
      query: async <T = any>(sql: string, options?: any): Promise<T> => {
        return this.monitorQuery(
          () => sequelize.query(sql, options) as Promise<T>,
          sql,
          options?.replacements || options?.bind
        );
      },

      rawQuery: async <T = any>(sql: string, parameters?: any[]): Promise<T> => {
        return this.monitorQuery(
          () => sequelize.query(sql, {
            type: QueryTypes.RAW,
            replacements: parameters
          }) as Promise<T>,
          sql,
          parameters
        );
      }
    };
  }

  /**
   * Clears query history and statistics cache
   */
  clearHistory(): void {
    this.queryHistory = [];
    this.statisticsCache = null;
    this.lastStatisticsUpdate = 0;
    logger.info('Query performance history cleared');
  }

  // Private helper methods

  private generateQueryHash(sql: string): string {
    // Simple hash function for query identification
    let hash = 0;
    const normalizedSQL = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    for (let i = 0; i < normalizedSQL.length; i++) {
      const char = normalizedSQL.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  private sanitizeSQL(sql: string): string {
    // Remove sensitive data from SQL for logging
    return sql
      .replace(/password\s*=\s*'[^']*'/gi, "password = '***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '***'");
  }

  private isTimeoutError(error: Error): boolean {
    return error.message.toLowerCase().includes('timeout') ||
           error.message.toLowerCase().includes('timed out');
  }

  private calculatePercentiles(sortedArray: number[]): PerformanceStatistics['percentileStats'] {
    if (sortedArray.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    const getPercentile = (arr: number[], percentile: number): number => {
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      const safeIndex = Math.max(0, Math.min(index, arr.length - 1));
      return arr[safeIndex] || 0;
    };

    return {
      p50: getPercentile(sortedArray, 50),
      p75: getPercentile(sortedArray, 75),
      p90: getPercentile(sortedArray, 90),
      p95: getPercentile(sortedArray, 95),
      p99: getPercentile(sortedArray, 99)
    };
  }

  private getEmptyStatistics(): PerformanceStatistics {
    return {
      totalQueries: 0,
      averageExecutionTime: 0,
      slowQueries: 0,
      verySlowQueries: 0,
      fastQueries: 0,
      queryTimeoutErrors: 0,
      percentileStats: { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 }
    };
  }
}

// Export singleton instance
export const performanceMonitor = new DatabasePerformanceMonitor();

// Export constants
export {
  SLOW_QUERY_THRESHOLD,
  VERY_SLOW_QUERY_THRESHOLD,
  QUERY_TIMEOUT_DEFAULT
};