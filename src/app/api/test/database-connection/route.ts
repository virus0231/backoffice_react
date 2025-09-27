/**
 * Database Connection Test API Endpoint
 * Tests database connectivity, schema validation, and basic data retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { withDatabaseMiddleware } from '@/lib/database/errorHandler';
import { logger } from '@/lib/database/logger';
export const dynamic = 'force-dynamic';

// Test result interface
interface DatabaseTestResult {
  success: boolean;
  timestamp: string;
  tests: {
    connection: TestResult;
    poolStatus: TestResult;
    schemaValidation: TestResult;
    basicQuery: TestResult;
    performanceCheck: TestResult;
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  };
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  message: string;
  details?: any;
  error?: string;
}

async function runDatabaseTests(): Promise<DatabaseTestResult> {
  const timestamp = new Date().toISOString();
  const tests: DatabaseTestResult['tests'] = {
    connection: await testConnection(),
    poolStatus: await testConnectionPool(),
    schemaValidation: await testSchemaValidation(),
    basicQuery: await testBasicQuery(),
    performanceCheck: await testPerformance()
  };

  // Calculate summary
  const testResults = Object.values(tests);
  const totalTests = testResults.length;
  const passedTests = testResults.filter(test => test.passed).length;
  const failedTests = totalTests - passedTests;

  let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  if (failedTests === 0) {
    overallHealth = 'healthy';
  } else if (passedTests >= totalTests / 2) {
    overallHealth = 'degraded';
  } else {
    overallHealth = 'unhealthy';
  }

  return {
    success: overallHealth !== 'unhealthy',
    timestamp,
    tests,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      overallHealth
    }
  };
}

async function testConnection(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { testDatabaseConnection } = await import('@/lib/database/sequelize');
    const isConnected = await testDatabaseConnection();
    const duration = Date.now() - startTime;

    if (isConnected) {
      return {
        name: 'Database Connection',
        passed: true,
        duration,
        message: 'Successfully connected to database',
        details: { connectionLatency: `${duration}ms` }
      };
    } else {
      return {
        name: 'Database Connection',
        passed: false,
        duration,
        message: 'Failed to connect to database',
        error: 'Connection test returned false'
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: 'Database Connection',
      passed: false,
      duration,
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testConnectionPool(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { getConnectionPoolStatus } = await import('@/lib/database/sequelize');
    const poolStatus = getConnectionPoolStatus();
    const duration = Date.now() - startTime;

    if (poolStatus.connected) {
      return {
        name: 'Connection Pool',
        passed: true,
        duration,
        message: 'Connection pool is operational',
        details: {
          poolSize: poolStatus.pool?.size || 0,
          availableConnections: poolStatus.pool?.available || 0,
          usedConnections: poolStatus.pool?.used || 0,
          pendingConnections: poolStatus.pool?.pending || 0
        }
      };
    } else {
      return {
        name: 'Connection Pool',
        passed: false,
        duration,
        message: 'Connection pool is not operational',
        error: 'Pool status indicates disconnected state'
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: 'Connection Pool',
      passed: false,
      duration,
      message: 'Failed to check connection pool status',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testSchemaValidation(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { getSequelizeInstance } = await import('@/lib/database/sequelize');
    const sequelize = getSequelizeInstance();

    // Test basic schema query
    const tableQuery = `
      SELECT TABLE_NAME
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name IN ('pw_transactions', 'pw_donors', 'pw_appeal', 'pw_fundlist')
      ORDER BY table_name
    `;

    const { QueryTypes } = await import('sequelize');
    const tables = await sequelize.query(tableQuery, { type: QueryTypes.SELECT });
    const duration = Date.now() - startTime;

    const expectedTables = ['pw_transactions', 'pw_donors', 'pw_appeal', 'pw_fundlist'];
    const foundTables = (tables as any[]).map((row: any) => row.TABLE_NAME);
    const missingTables = expectedTables.filter(table => !foundTables.includes(table));

    if (missingTables.length === 0) {
      return {
        name: 'Schema Validation',
        passed: true,
        duration,
        message: 'All required database tables found',
        details: {
          expectedTables,
          foundTables
        }
      };
    } else {
      return {
        name: 'Schema Validation',
        passed: false,
        duration,
        message: 'Missing required database tables',
        error: `Missing tables: ${missingTables.join(', ')}`,
        details: {
          expectedTables,
          foundTables,
          missingTables
        }
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: 'Schema Validation',
      passed: false,
      duration,
      message: 'Schema validation failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testBasicQuery(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { getSequelizeInstance } = await import('@/lib/database/sequelize');
    const sequelize = getSequelizeInstance();

    // Test basic query execution with a simple SELECT
    const testQuery = 'SELECT 1 as test_value, NOW() as current_time';
    const { QueryTypes } = await import('sequelize');
    const result = await sequelize.query(testQuery, { type: QueryTypes.SELECT });
    const duration = Date.now() - startTime;

    if (result && result.length > 0) {
      return {
        name: 'Basic Query Execution',
        passed: true,
        duration,
        message: 'Basic database query executed successfully',
        details: {
          queryResult: result[0],
          queryLatency: `${duration}ms`
        }
      };
    } else {
      return {
        name: 'Basic Query Execution',
        passed: false,
        duration,
        message: 'Basic query returned no results',
        error: 'Query execution returned empty result set'
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: 'Basic Query Execution',
      passed: false,
      duration,
      message: 'Basic query execution failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testPerformance(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { performanceMonitor } = await import('@/lib/database/performanceMonitor');
    const stats = performanceMonitor.getPerformanceStatistics();
    const trends = performanceMonitor.getPerformanceTrends(30); // Last 30 minutes
    const duration = Date.now() - startTime;

    return {
      name: 'Performance Check',
      passed: true,
      duration,
      message: 'Performance monitoring is operational',
      details: {
        totalQueries: stats.totalQueries,
        averageExecutionTime: stats.averageExecutionTime,
        slowQueries: stats.slowQueries,
        recentTrends: trends
      }
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: 'Performance Check',
      passed: false,
      duration,
      message: 'Performance monitoring check failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// GET endpoint for database connection testing
export const GET = withDatabaseMiddleware(async (request: NextRequest) => {
  logger.info('Database connection test requested', {
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  const testResult = await runDatabaseTests();

  logger.info('Database connection test completed', {
    success: testResult.success,
    overallHealth: testResult.summary.overallHealth,
    passedTests: testResult.summary.passedTests,
    totalTests: testResult.summary.totalTests
  });

  // Return appropriate HTTP status based on test results
  const statusCode = testResult.success ? 200 : 503;

  return {
    ...testResult,
    httpStatus: statusCode
  };
});
