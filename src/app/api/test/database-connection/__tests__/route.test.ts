/**
 * Database Connection API Tests
 * Tests the database connection test endpoint functionality
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock all dependencies
jest.mock('@/lib/database/sequelize', () => ({
  testDatabaseConnection: jest.fn(),
  getConnectionPoolStatus: jest.fn(),
  getSequelizeInstance: jest.fn()
}));

jest.mock('@/lib/database/errorHandler', () => ({
  withDatabaseMiddleware: jest.fn((handler) => handler),
  checkDatabaseHealth: jest.fn()
}));

jest.mock('@/lib/database/performanceMonitor', () => ({
  performanceMonitor: {
    getPerformanceStatistics: jest.fn(),
    getPerformanceTrends: jest.fn()
  }
}));

jest.mock('@/lib/database/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('/api/test/database-connection', () => {
  const mockSequelize = {
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const { testDatabaseConnection, getConnectionPoolStatus, getSequelizeInstance } = require('@/lib/database/sequelize');
    const { performanceMonitor } = require('@/lib/database/performanceMonitor');

    testDatabaseConnection.mockResolvedValue(true);
    getConnectionPoolStatus.mockReturnValue({
      connected: true,
      pool: { size: 10, available: 8, used: 2, pending: 0 }
    });
    getSequelizeInstance.mockReturnValue(mockSequelize);

    performanceMonitor.getPerformanceStatistics.mockReturnValue({
      totalQueries: 100,
      averageExecutionTime: 150,
      slowQueries: 5,
      verySlowQueries: 1,
      queryTimeoutErrors: 0
    });

    performanceMonitor.getPerformanceTrends.mockReturnValue({
      windowStart: new Date().toISOString(),
      windowEnd: new Date().toISOString(),
      queryCount: 50,
      averageExecutionTime: 140,
      slowQueryRate: 5
    });
  });

  describe('GET /api/test/database-connection', () => {
    test('should return healthy status when all tests pass', async () => {
      // Mock successful database operations
      mockSequelize.query
        .mockResolvedValueOnce([
          { TABLE_NAME: 'pw_transactions' },
          { TABLE_NAME: 'pw_donors' },
          { TABLE_NAME: 'pw_appeal' },
          { TABLE_NAME: 'pw_fundlist' }
        ])
        .mockResolvedValueOnce([{ test_value: 1, current_time: new Date() }]);

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.summary.overallHealth).toBe('healthy');
      expect(response.summary.passedTests).toBe(5);
      expect(response.summary.totalTests).toBe(5);
    });

    test('should return degraded status when some tests fail', async () => {
      // Mock connection failure
      const { testDatabaseConnection } = require('@/lib/database/sequelize');
      testDatabaseConnection.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.summary.overallHealth).toBe('degraded');
      expect(response.summary.failedTests).toBeGreaterThan(0);
    });

    test('should return unhealthy status when most tests fail', async () => {
      // Mock multiple failures
      const { testDatabaseConnection, getConnectionPoolStatus } = require('@/lib/database/sequelize');
      testDatabaseConnection.mockResolvedValue(false);
      getConnectionPoolStatus.mockReturnValue({ connected: false, pool: null });

      mockSequelize.query.mockRejectedValue(new Error('Database not accessible'));

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.success).toBe(false);
      expect(response.summary.overallHealth).toBe('unhealthy');
    });

    test('should test database connection correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.connection).toBeDefined();
      expect(response.tests.connection.name).toBe('Database Connection');
      expect(response.tests.connection.passed).toBe(true);
      expect(response.tests.connection.duration).toBeGreaterThanOrEqual(0);
    });

    test('should test connection pool status', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.poolStatus).toBeDefined();
      expect(response.tests.poolStatus.name).toBe('Connection Pool');
      expect(response.tests.poolStatus.passed).toBe(true);
      expect(response.tests.poolStatus.details).toEqual({
        poolSize: 10,
        availableConnections: 8,
        usedConnections: 2,
        pendingConnections: 0
      });
    });

    test('should validate database schema', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { TABLE_NAME: 'pw_transactions' },
        { TABLE_NAME: 'pw_donors' },
        { TABLE_NAME: 'pw_appeal' },
        { TABLE_NAME: 'pw_fundlist' }
      ]);

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.schemaValidation).toBeDefined();
      expect(response.tests.schemaValidation.name).toBe('Schema Validation');
      expect(response.tests.schemaValidation.passed).toBe(true);
      expect(response.tests.schemaValidation.details.foundTables).toEqual([
        'pw_transactions', 'pw_donors', 'pw_appeal', 'pw_fundlist'
      ]);
    });

    test('should detect missing database tables', async () => {
      mockSequelize.query.mockResolvedValueOnce([
        { TABLE_NAME: 'pw_transactions' },
        { TABLE_NAME: 'pw_donors' }
        // Missing pw_appeal and pw_fundlist
      ]);

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.schemaValidation.passed).toBe(false);
      expect(response.tests.schemaValidation.details.missingTables).toEqual([
        'pw_appeal', 'pw_fundlist'
      ]);
    });

    test('should test basic query execution', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([]) // Schema query
        .mockResolvedValueOnce([{ test_value: 1, current_time: new Date() }]); // Basic query

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.basicQuery).toBeDefined();
      expect(response.tests.basicQuery.name).toBe('Basic Query Execution');
      expect(response.tests.basicQuery.passed).toBe(true);
      expect(response.tests.basicQuery.details.queryResult).toEqual({
        test_value: 1,
        current_time: expect.any(Date)
      });
    });

    test('should test performance monitoring', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.performanceCheck).toBeDefined();
      expect(response.tests.performanceCheck.name).toBe('Performance Check');
      expect(response.tests.performanceCheck.passed).toBe(true);
      expect(response.tests.performanceCheck.details).toEqual({
        totalQueries: 100,
        averageExecutionTime: 150,
        slowQueries: 5,
        recentTrends: expect.any(Object)
      });
    });

    test('should include test execution times', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      Object.values(response.tests).forEach((test: any) => {
        expect(test.duration).toBeGreaterThanOrEqual(0);
        expect(typeof test.duration).toBe('number');
      });
    });

    test('should handle database connection errors gracefully', async () => {
      const { testDatabaseConnection } = require('@/lib/database/sequelize');
      testDatabaseConnection.mockRejectedValue(new Error('Connection timeout'));

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.connection.passed).toBe(false);
      expect(response.tests.connection.error).toBe('Connection timeout');
    });

    test('should handle schema validation errors', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Access denied'));

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.schemaValidation.passed).toBe(false);
      expect(response.tests.schemaValidation.error).toBe('Access denied');
    });

    test('should handle basic query errors', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([]) // Schema query succeeds
        .mockRejectedValue(new Error('Query execution failed')); // Basic query fails

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.basicQuery.passed).toBe(false);
      expect(response.tests.basicQuery.error).toBe('Query execution failed');
    });

    test('should include timestamp in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });

    test('should include HTTP status in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.httpStatus).toBeDefined();
      expect([200, 503]).toContain(response.httpStatus);
    });
  });

  describe('Error Handling', () => {
    test('should handle performance monitor errors', async () => {
      const { performanceMonitor } = require('@/lib/database/performanceMonitor');
      performanceMonitor.getPerformanceStatistics.mockImplementation(() => {
        throw new Error('Performance monitor error');
      });

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.performanceCheck.passed).toBe(false);
      expect(response.tests.performanceCheck.error).toBe('Performance monitor error');
    });

    test('should handle connection pool status errors', async () => {
      const { getConnectionPoolStatus } = require('@/lib/database/sequelize');
      getConnectionPoolStatus.mockImplementation(() => {
        throw new Error('Pool status error');
      });

      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response.tests.poolStatus.passed).toBe(false);
      expect(response.tests.poolStatus.error).toBe('Pool status error');
    });
  });

  describe('Response Format', () => {
    test('should return consistent response structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/database-connection');
      const response = await GET(request);

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('tests');
      expect(response).toHaveProperty('summary');
      expect(response).toHaveProperty('httpStatus');

      expect(response.tests).toHaveProperty('connection');
      expect(response.tests).toHaveProperty('poolStatus');
      expect(response.tests).toHaveProperty('schemaValidation');
      expect(response.tests).toHaveProperty('basicQuery');
      expect(response.tests).toHaveProperty('performanceCheck');

      expect(response.summary).toHaveProperty('totalTests');
      expect(response.summary).toHaveProperty('passedTests');
      expect(response.summary).toHaveProperty('failedTests');
      expect(response.summary).toHaveProperty('overallHealth');
    });
  });
});