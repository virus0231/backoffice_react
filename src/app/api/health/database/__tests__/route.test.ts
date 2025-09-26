/**
 * Database Health API Tests
 * Tests the database health monitoring endpoint functionality
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock all dependencies
jest.mock('@/lib/database/healthMonitor', () => ({
  databaseHealthMonitor: {
    performHealthCheck: jest.fn(),
    getUptimeStatus: jest.fn(),
    getHealthHistory: jest.fn()
  }
}));

jest.mock('@/lib/database/performanceMonitor', () => ({
  performanceMonitor: {
    getPerformanceStatistics: jest.fn(),
    getPerformanceTrends: jest.fn()
  }
}));

jest.mock('@/lib/database/sequelize', () => ({
  getConnectionPoolStatus: jest.fn()
}));

jest.mock('@/lib/database/errorHandler', () => ({
  withDatabaseMiddleware: jest.fn((handler) => handler)
}));

jest.mock('@/lib/database/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('/api/health/database', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
    const { performanceMonitor } = require('@/lib/database/performanceMonitor');
    const { getConnectionPoolStatus } = require('@/lib/database/sequelize');

    databaseHealthMonitor.performHealthCheck.mockResolvedValue({
      timestamp: new Date().toISOString(),
      healthy: true,
      connectionPool: { size: 10, available: 8, used: 2, pending: 0 },
      latency: 50
    });

    databaseHealthMonitor.getUptimeStatus.mockReturnValue({
      uptime: 3600000, // 1 hour
      uptimeFormatted: '1h 0m 0s',
      healthyPercentage: 98.5
    });

    databaseHealthMonitor.getHealthHistory.mockReturnValue([
      { timestamp: new Date().toISOString(), healthy: true },
      { timestamp: new Date().toISOString(), healthy: true }
    ]);

    getConnectionPoolStatus.mockReturnValue({
      connected: true,
      pool: { size: 10, available: 8, used: 2, pending: 0 }
    });

    performanceMonitor.getPerformanceStatistics.mockReturnValue({
      totalQueries: 1000,
      averageExecutionTime: 120,
      slowQueries: 15,
      verySlowQueries: 2,
      queryTimeoutErrors: 0
    });

    performanceMonitor.getPerformanceTrends.mockReturnValue({
      windowStart: new Date().toISOString(),
      windowEnd: new Date().toISOString(),
      queryCount: 100,
      averageExecutionTime: 110,
      slowQueryRate: 2.5
    });
  });

  describe('GET /api/health/database', () => {
    test('should return healthy status with complete information', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.status).toBe('healthy');
      expect(response.timestamp).toBeDefined();
      expect(response.uptime).toBeDefined();
      expect(response.connectionPool).toBeDefined();
      expect(response.performance).toBeDefined();
      expect(response.recentHealthChecks).toBeDefined();
    });

    test('should calculate connection pool utilization correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.connectionPool.utilizationPercentage).toBe(20); // 2/10 * 100
      expect(response.connectionPool.size).toBe(10);
      expect(response.connectionPool.used).toBe(2);
      expect(response.connectionPool.available).toBe(8);
    });

    test('should include uptime information', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.uptime.milliseconds).toBe(3600000);
      expect(response.uptime.formatted).toBe('1h 0m 0s');
      expect(response.uptime.healthyPercentage).toBe(98.5);
    });

    test('should include performance metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.performance.totalQueries).toBe(1000);
      expect(response.performance.averageExecutionTime).toBe(120);
      expect(response.performance.slowQueries).toBe(15);
      expect(response.performance.verySlowQueries).toBe(2);
      expect(response.performance.queryTimeoutErrors).toBe(0);
      expect(response.performance.recentTrends).toBeDefined();
    });

    test('should return degraded status for low uptime', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.getUptimeStatus.mockReturnValue({
        uptime: 3600000,
        uptimeFormatted: '1h 0m 0s',
        healthyPercentage: 92 // Below 95% threshold
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.status).toBe('degraded');
      expect(response.alerts).toContain('Database uptime is 92.0% (below 95%)');
    });

    test('should return degraded status for high pool utilization', async () => {
      const { getConnectionPoolStatus } = require('@/lib/database/sequelize');
      getConnectionPoolStatus.mockReturnValue({
        connected: true,
        pool: { size: 10, available: 1, used: 9, pending: 0 } // 90% utilization
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.status).toBe('degraded');
      expect(response.alerts).toContain('Connection pool utilization is 90.0% (above 80%)');
    });

    test('should return degraded status for high slow query percentage', async () => {
      const { performanceMonitor } = require('@/lib/database/performanceMonitor');
      performanceMonitor.getPerformanceStatistics.mockReturnValue({
        totalQueries: 100,
        averageExecutionTime: 120,
        slowQueries: 15, // 15% slow queries (above 10%)
        verySlowQueries: 2,
        queryTimeoutErrors: 0
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.status).toBe('degraded');
      expect(response.alerts).toContain('High percentage of slow queries detected');
    });

    test('should return unhealthy status when database is not available', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.performHealthCheck.mockResolvedValue({
        timestamp: new Date().toISOString(),
        healthy: false,
        connectionPool: { size: 0, available: 0, used: 0, pending: 0 },
        error: 'Connection failed'
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.status).toBe('unhealthy');
      expect(response.alerts).toContain('Database connection is not available');
    });

    test('should include performance alerts', async () => {
      const { performanceMonitor } = require('@/lib/database/performanceMonitor');
      performanceMonitor.getPerformanceStatistics.mockReturnValue({
        totalQueries: 100,
        averageExecutionTime: 1500, // Above 1000ms threshold
        slowQueries: 5,
        verySlowQueries: 2,
        queryTimeoutErrors: 3 // Has timeout errors
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.alerts).toContain('Average query time is 1500ms (above 1000ms)');
      expect(response.alerts).toContain('3 query timeout errors detected');
    });

    test('should return simplified response when detailed=false', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database?detailed=false');
      const response = await GET(request);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('connected');
      expect(response).toHaveProperty('uptime');
      expect(response).toHaveProperty('healthyPercentage');

      // Should not have detailed properties
      expect(response).not.toHaveProperty('connectionPool');
      expect(response).not.toHaveProperty('performance');
      expect(response).not.toHaveProperty('recentHealthChecks');
    });

    test('should return detailed response by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response).toHaveProperty('connectionPool');
      expect(response).toHaveProperty('performance');
      expect(response).toHaveProperty('recentHealthChecks');
      expect(response).toHaveProperty('httpStatus');
    });

    test('should handle disconnected pool status', async () => {
      const { getConnectionPoolStatus } = require('@/lib/database/sequelize');
      getConnectionPoolStatus.mockReturnValue({
        connected: false,
        pool: null
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.connectionPool.connected).toBe(false);
      expect(response.connectionPool.utilizationPercentage).toBe(0);
    });

    test('should include recent health checks', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      const mockHealthHistory = [
        { timestamp: '2024-01-01T10:00:00Z', healthy: true },
        { timestamp: '2024-01-01T10:01:00Z', healthy: true },
        { timestamp: '2024-01-01T10:02:00Z', healthy: false }
      ];
      databaseHealthMonitor.getHealthHistory.mockReturnValue(mockHealthHistory);

      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response.recentHealthChecks).toEqual(mockHealthHistory);
    });

    test('should return appropriate HTTP status codes', async () => {
      // Test healthy status
      let request = new NextRequest('http://localhost:3000/api/health/database');
      let response = await GET(request);
      expect(response.httpStatus).toBe(200);

      // Test degraded status
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.getUptimeStatus.mockReturnValue({
        uptime: 3600000,
        uptimeFormatted: '1h 0m 0s',
        healthyPercentage: 92 // Degraded
      });

      request = new NextRequest('http://localhost:3000/api/health/database');
      response = await GET(request);
      expect(response.httpStatus).toBe(200); // Still 200 for degraded

      // Test unhealthy status
      databaseHealthMonitor.performHealthCheck.mockResolvedValue({
        timestamp: new Date().toISOString(),
        healthy: false,
        connectionPool: { size: 0, available: 0, used: 0, pending: 0 }
      });

      request = new NextRequest('http://localhost:3000/api/health/database');
      response = await GET(request);
      expect(response.httpStatus).toBe(503); // Service Unavailable
    });
  });

  describe('POST /api/health/database', () => {
    test('should trigger manual health check', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      const mockHealthCheck = {
        timestamp: new Date().toISOString(),
        healthy: true,
        connectionPool: { size: 10, available: 8, used: 2, pending: 0 },
        latency: 45
      };
      databaseHealthMonitor.performHealthCheck.mockResolvedValue(mockHealthCheck);

      const request = new NextRequest('http://localhost:3000/api/health/database', {
        method: 'POST'
      });
      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBe('Manual health check completed');
      expect(response.timestamp).toBeDefined();
      expect(response.healthCheck).toEqual(mockHealthCheck);

      expect(databaseHealthMonitor.performHealthCheck).toHaveBeenCalled();
    });

    test('should handle health check failures in manual trigger', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.performHealthCheck.mockRejectedValue(new Error('Health check failed'));

      const request = new NextRequest('http://localhost:3000/api/health/database', {
        method: 'POST'
      });

      // Should not throw, should be handled by middleware
      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle health monitor errors gracefully', async () => {
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.performHealthCheck.mockRejectedValue(new Error('Monitor error'));

      const request = new NextRequest('http://localhost:3000/api/health/database');

      // Should not throw, middleware should handle it
      const response = await GET(request);
      expect(response).toBeDefined();
    });

    test('should handle performance monitor errors', async () => {
      const { performanceMonitor } = require('@/lib/database/performanceMonitor');
      performanceMonitor.getPerformanceStatistics.mockImplementation(() => {
        throw new Error('Performance error');
      });

      const request = new NextRequest('http://localhost:3000/api/health/database');

      // Should not throw, should handle gracefully
      const response = await GET(request);
      expect(response).toBeDefined();
    });
  });

  describe('Response Format', () => {
    test('should return consistent response structure for detailed response', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database');
      const response = await GET(request);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('uptime');
      expect(response).toHaveProperty('connectionPool');
      expect(response).toHaveProperty('performance');
      expect(response).toHaveProperty('recentHealthChecks');
      expect(response).toHaveProperty('httpStatus');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.status);
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });

    test('should return consistent response structure for simplified response', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database?detailed=false');
      const response = await GET(request);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('connected');
      expect(response).toHaveProperty('uptime');
      expect(response).toHaveProperty('healthyPercentage');

      expect(typeof response.connected).toBe('boolean');
      expect(typeof response.uptime).toBe('string');
      expect(typeof response.healthyPercentage).toBe('number');
    });

    test('should include alerts only when there are issues', async () => {
      // Test healthy status (no alerts)
      let request = new NextRequest('http://localhost:3000/api/health/database');
      let response = await GET(request);
      expect(response.alerts).toBeUndefined();

      // Test degraded status (with alerts)
      const { databaseHealthMonitor } = require('@/lib/database/healthMonitor');
      databaseHealthMonitor.getUptimeStatus.mockReturnValue({
        uptime: 3600000,
        uptimeFormatted: '1h 0m 0s',
        healthyPercentage: 92 // Below threshold
      });

      request = new NextRequest('http://localhost:3000/api/health/database');
      response = await GET(request);
      expect(response.alerts).toBeDefined();
      expect(Array.isArray(response.alerts)).toBe(true);
      expect(response.alerts.length).toBeGreaterThan(0);
    });
  });
});