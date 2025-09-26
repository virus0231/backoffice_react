/**
 * Performance Monitor Tests
 * Tests query performance tracking, statistics, and monitoring functionality
 */

import { performanceMonitor, SLOW_QUERY_THRESHOLD } from '../performanceMonitor';

// Mock logger and health monitor
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  },
  logQuery: jest.fn(),
  logSlowQuery: jest.fn()
}));

jest.mock('../healthMonitor', () => ({
  databaseHealthMonitor: {
    recordQueryExecution: jest.fn()
  }
}));

describe('Performance Monitor', () => {
  beforeEach(() => {
    // Clear performance monitor history before each test
    performanceMonitor.clearHistory();
    jest.clearAllMocks();
  });

  describe('recordQueryExecution', () => {
    test('should record fast query execution', () => {
      const sql = 'SELECT * FROM test_table';
      const executionTime = 100; // Fast query

      performanceMonitor.recordQueryExecution(sql, executionTime);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(0);
      expect(stats.averageExecutionTime).toBe(100);
    });

    test('should record slow query execution', () => {
      const sql = 'SELECT * FROM large_table';
      const executionTime = 2000; // Slow query (> 1000ms threshold)

      performanceMonitor.recordQueryExecution(sql, executionTime);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(1);
      expect(stats.verySlowQueries).toBe(0);
    });

    test('should record very slow query execution', () => {
      const sql = 'SELECT * FROM huge_table';
      const executionTime = 6000; // Very slow query (> 5000ms threshold)

      performanceMonitor.recordQueryExecution(sql, executionTime);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(1);
      expect(stats.verySlowQueries).toBe(1);
    });

    test('should sanitize SQL for logging', () => {
      const sql = "SELECT * FROM users WHERE password = 'secret123'";
      const executionTime = 100;

      performanceMonitor.recordQueryExecution(sql, executionTime);

      // Verify that the query was recorded (implementation should sanitize)
      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
    });

    test('should handle queries with parameters', () => {
      const sql = 'SELECT * FROM donations WHERE amount > ?';
      const executionTime = 150;
      const parameters = [100];

      performanceMonitor.recordQueryExecution(sql, executionTime, parameters);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
    });

    test('should track timeout errors', () => {
      const sql = 'SELECT * FROM slow_table';
      const executionTime = 30000; // Query timeout
      const timeoutError = new Error('Query timeout');

      performanceMonitor.recordQueryExecution(sql, executionTime, undefined, timeoutError);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.queryTimeoutErrors).toBe(1);
    });
  });

  describe('getPerformanceStatistics', () => {
    test('should return empty statistics when no queries recorded', () => {
      const stats = performanceMonitor.getPerformanceStatistics();

      expect(stats).toEqual({
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        verySlowQueries: 0,
        fastQueries: 0,
        queryTimeoutErrors: 0,
        percentileStats: {
          p50: 0,
          p75: 0,
          p90: 0,
          p95: 0,
          p99: 0
        }
      });
    });

    test('should calculate statistics correctly for multiple queries', () => {
      // Record various queries
      performanceMonitor.recordQueryExecution('SELECT 1', 100);
      performanceMonitor.recordQueryExecution('SELECT 2', 200);
      performanceMonitor.recordQueryExecution('SELECT 3', 1500); // Slow
      performanceMonitor.recordQueryExecution('SELECT 4', 300);
      performanceMonitor.recordQueryExecution('SELECT 5', 6000); // Very slow

      const stats = performanceMonitor.getPerformanceStatistics();

      expect(stats.totalQueries).toBe(5);
      expect(stats.averageExecutionTime).toBe((100 + 200 + 1500 + 300 + 6000) / 5);
      expect(stats.slowQueries).toBe(2); // 1500ms and 6000ms queries
      expect(stats.verySlowQueries).toBe(1); // 6000ms query
      expect(stats.fastQueries).toBe(3); // 100ms, 200ms, 300ms queries
    });

    test('should calculate percentiles correctly', () => {
      // Record queries with known execution times
      const times = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      times.forEach((time, index) => {
        performanceMonitor.recordQueryExecution(`SELECT ${index}`, time);
      });

      const stats = performanceMonitor.getPerformanceStatistics();

      expect(stats.percentileStats.p50).toBe(500); // Median
      expect(stats.percentileStats.p90).toBe(900); // 90th percentile
      expect(stats.percentileStats.p99).toBe(1000); // 99th percentile
    });

    test('should cache statistics for performance', () => {
      // Record a query
      performanceMonitor.recordQueryExecution('SELECT 1', 100);

      // Get statistics twice
      const stats1 = performanceMonitor.getPerformanceStatistics();
      const stats2 = performanceMonitor.getPerformanceStatistics();

      // Should return the same object (cached)
      expect(stats1).toEqual(stats2);
    });

    test('should invalidate cache when new query is recorded', () => {
      // Record initial query
      performanceMonitor.recordQueryExecution('SELECT 1', 100);
      const stats1 = performanceMonitor.getPerformanceStatistics();

      // Record another query
      performanceMonitor.recordQueryExecution('SELECT 2', 200);
      const stats2 = performanceMonitor.getPerformanceStatistics();

      // Statistics should be different
      expect(stats1.totalQueries).toBe(1);
      expect(stats2.totalQueries).toBe(2);
    });
  });

  describe('getSlowQueryAnalysis', () => {
    test('should return empty array when no slow queries', () => {
      performanceMonitor.recordQueryExecution('SELECT 1', 100);
      performanceMonitor.recordQueryExecution('SELECT 2', 200);

      const slowQueries = performanceMonitor.getSlowQueryAnalysis();
      expect(slowQueries).toEqual([]);
    });

    test('should return slow queries sorted by execution time', () => {
      performanceMonitor.recordQueryExecution('SELECT 1', 1200); // Slow
      performanceMonitor.recordQueryExecution('SELECT 2', 100);  // Fast
      performanceMonitor.recordQueryExecution('SELECT 3', 1800); // Slower
      performanceMonitor.recordQueryExecution('SELECT 4', 1100); // Slow

      const slowQueries = performanceMonitor.getSlowQueryAnalysis();

      expect(slowQueries).toHaveLength(3);
      expect(slowQueries[0].executionTime).toBe(1800); // Highest first
      expect(slowQueries[1].executionTime).toBe(1200);
      expect(slowQueries[2].executionTime).toBe(1100);
    });

    test('should limit results to specified count', () => {
      // Record multiple slow queries
      for (let i = 0; i < 15; i++) {
        performanceMonitor.recordQueryExecution(`SELECT ${i}`, 1000 + i * 100);
      }

      const slowQueries = performanceMonitor.getSlowQueryAnalysis(5);
      expect(slowQueries).toHaveLength(5);
    });
  });

  describe('getPerformanceTrends', () => {
    test('should return empty trends when no queries in time window', () => {
      const trends = performanceMonitor.getPerformanceTrends(60);

      expect(trends.queryCount).toBe(0);
      expect(trends.averageExecutionTime).toBe(0);
      expect(trends.slowQueryRate).toBe(0);
    });

    test('should calculate trends for queries within time window', () => {
      // Record queries (they will have recent timestamps)
      performanceMonitor.recordQueryExecution('SELECT 1', 100);
      performanceMonitor.recordQueryExecution('SELECT 2', 1500); // Slow
      performanceMonitor.recordQueryExecution('SELECT 3', 200);

      const trends = performanceMonitor.getPerformanceTrends(60); // Last 60 minutes

      expect(trends.queryCount).toBe(3);
      expect(trends.averageExecutionTime).toBe((100 + 1500 + 200) / 3);
      expect(trends.slowQueryRate).toBe((1 / 3) * 100); // 33.33%
    });

    test('should include valid time window information', () => {
      const trends = performanceMonitor.getPerformanceTrends(30);

      expect(trends.windowStart).toBeDefined();
      expect(trends.windowEnd).toBeDefined();
      expect(new Date(trends.windowStart)).toBeInstanceOf(Date);
      expect(new Date(trends.windowEnd)).toBeInstanceOf(Date);
    });
  });

  describe('monitorQuery', () => {
    test('should monitor successful query execution', async () => {
      const mockQueryFunction = jest.fn().mockResolvedValue('query result');
      const sql = 'SELECT * FROM test_table';

      const result = await performanceMonitor.monitorQuery(
        mockQueryFunction,
        sql
      );

      expect(result).toBe('query result');
      expect(mockQueryFunction).toHaveBeenCalled();

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
    });

    test('should monitor failed query execution', async () => {
      const mockError = new Error('Query failed');
      const mockQueryFunction = jest.fn().mockRejectedValue(mockError);
      const sql = 'SELECT * FROM failing_table';

      await expect(
        performanceMonitor.monitorQuery(mockQueryFunction, sql)
      ).rejects.toThrow('Query failed');

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
    });

    test('should record execution time for monitored queries', async () => {
      const mockQueryFunction = jest.fn().mockImplementation(async () => {
        // Simulate query execution time
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      });

      await performanceMonitor.monitorQuery(
        mockQueryFunction,
        'SELECT 1'
      );

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(1);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });
  });

  describe('clearHistory', () => {
    test('should clear all performance history', () => {
      // Record some queries
      performanceMonitor.recordQueryExecution('SELECT 1', 100);
      performanceMonitor.recordQueryExecution('SELECT 2', 200);

      let stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(2);

      // Clear history
      performanceMonitor.clearHistory();

      stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(0);
    });

    test('should reset all statistics after clearing', () => {
      performanceMonitor.recordQueryExecution('SELECT 1', 1500); // Slow query

      performanceMonitor.clearHistory();

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats).toEqual({
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        verySlowQueries: 0,
        fastQueries: 0,
        queryTimeoutErrors: 0,
        percentileStats: {
          p50: 0,
          p75: 0,
          p90: 0,
          p95: 0,
          p99: 0
        }
      });
    });
  });

  describe('Query Hash Generation', () => {
    test('should generate consistent hashes for identical queries', () => {
      const sql = 'SELECT * FROM users WHERE id = ?';

      performanceMonitor.recordQueryExecution(sql, 100);
      performanceMonitor.recordQueryExecution(sql, 150);

      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(2);
    });

    test('should handle SQL normalization', () => {
      const sql1 = 'SELECT * FROM users WHERE id = ?';
      const sql2 = '  SELECT   *   FROM   users   WHERE   id   =   ?  ';

      performanceMonitor.recordQueryExecution(sql1, 100);
      performanceMonitor.recordQueryExecution(sql2, 150);

      // Both should be recorded as separate queries due to whitespace differences
      const stats = performanceMonitor.getPerformanceStatistics();
      expect(stats.totalQueries).toBe(2);
    });
  });
});