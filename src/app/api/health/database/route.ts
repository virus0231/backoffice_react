/**
 * Database Health Monitoring API Endpoint
 * Provides real-time database health status and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { databaseHealthMonitor } from '@/lib/database/healthMonitor';
import { performanceMonitor } from '@/lib/database/performanceMonitor';
import { getConnectionPoolStatus } from '@/lib/database/sequelize';
import { withDatabaseMiddleware } from '@/lib/database/errorHandler';
import { logger } from '@/lib/database/logger';

// Health status response interface
interface DatabaseHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: {
    milliseconds: number;
    formatted: string;
    healthyPercentage: number;
  };
  connectionPool: {
    connected: boolean;
    size: number;
    available: number;
    used: number;
    pending: number;
    utilizationPercentage: number;
  };
  performance: {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    verySlowQueries: number;
    queryTimeoutErrors: number;
    recentTrends: any;
  };
  recentHealthChecks: any[];
  alerts?: string[];
}

async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  const timestamp = new Date().toISOString();

  // Perform health check
  const currentHealthCheck = await databaseHealthMonitor.performHealthCheck();

  // Get uptime status
  const uptimeStatus = databaseHealthMonitor.getUptimeStatus();

  // Get connection pool status
  const poolStatus = getConnectionPoolStatus();
  const poolUtilization = poolStatus.connected && poolStatus.pool
    ? (poolStatus.pool.used / poolStatus.pool.size) * 100
    : 0;

  // Get performance metrics
  const performanceStats = performanceMonitor.getPerformanceStatistics();
  const performanceTrends = performanceMonitor.getPerformanceTrends(60); // Last hour

  // Get recent health checks
  const recentHealthChecks = databaseHealthMonitor.getHealthHistory(10);

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  const alerts: string[] = [];

  if (!currentHealthCheck.healthy) {
    status = 'unhealthy';
    alerts.push('Database connection is not available');
  } else if (uptimeStatus.healthyPercentage < 95) {
    status = 'degraded';
    alerts.push(`Database uptime is ${uptimeStatus.healthyPercentage.toFixed(1)}% (below 95%)`);
  } else if (poolUtilization > 80) {
    status = 'degraded';
    alerts.push(`Connection pool utilization is ${poolUtilization.toFixed(1)}% (above 80%)`);
  } else if (performanceStats.slowQueries > performanceStats.totalQueries * 0.1) {
    status = 'degraded';
    alerts.push('High percentage of slow queries detected');
  } else {
    status = 'healthy';
  }

  // Additional performance alerts
  if (performanceStats.averageExecutionTime > 1000) {
    alerts.push(`Average query time is ${performanceStats.averageExecutionTime.toFixed(0)}ms (above 1000ms)`);
  }

  if (performanceStats.queryTimeoutErrors > 0) {
    alerts.push(`${performanceStats.queryTimeoutErrors} query timeout errors detected`);
  }

  return {
    status,
    timestamp,
    uptime: {
      milliseconds: uptimeStatus.uptime,
      formatted: uptimeStatus.uptimeFormatted,
      healthyPercentage: uptimeStatus.healthyPercentage
    },
    connectionPool: {
      connected: poolStatus.connected,
      size: poolStatus.pool?.size || 0,
      available: poolStatus.pool?.available || 0,
      used: poolStatus.pool?.used || 0,
      pending: poolStatus.pool?.pending || 0,
      utilizationPercentage: poolUtilization
    },
    performance: {
      totalQueries: performanceStats.totalQueries,
      averageExecutionTime: performanceStats.averageExecutionTime,
      slowQueries: performanceStats.slowQueries,
      verySlowQueries: performanceStats.verySlowQueries,
      queryTimeoutErrors: performanceStats.queryTimeoutErrors,
      recentTrends: performanceTrends
    },
    recentHealthChecks,
    alerts: alerts.length > 0 ? alerts : undefined
  };
}

// GET endpoint for database health monitoring
export const GET = withDatabaseMiddleware(async (request: NextRequest) => {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  logger.debug('Database health check requested', {
    detailed,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  const healthStatus = await getDatabaseHealth();

  // Log health status changes
  if (healthStatus.status !== 'healthy') {
    logger.warn('Database health status is not healthy', {
      status: healthStatus.status,
      alerts: healthStatus.alerts,
      connectionPool: healthStatus.connectionPool,
      uptime: healthStatus.uptime.healthyPercentage
    });
  }

  // Return simplified response if not detailed
  if (!detailed) {
    return {
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      connected: healthStatus.connectionPool.connected,
      uptime: healthStatus.uptime.formatted,
      healthyPercentage: healthStatus.uptime.healthyPercentage,
      alerts: healthStatus.alerts,
      httpStatus: healthStatus.status === 'healthy' ? 200
                 : healthStatus.status === 'degraded' ? 200
                 : 503
    };
  }

  // Return appropriate HTTP status based on health
  const statusCode = healthStatus.status === 'healthy' ? 200
                   : healthStatus.status === 'degraded' ? 200
                   : 503;

  return {
    ...healthStatus,
    httpStatus: statusCode
  };
});

// POST endpoint for manual health check trigger
export const POST = withDatabaseMiddleware(async (request: NextRequest) => {
  logger.info('Manual database health check triggered', {
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  // Force a fresh health check
  const healthCheck = await databaseHealthMonitor.performHealthCheck();

  return {
    success: true,
    message: 'Manual health check completed',
    timestamp: new Date().toISOString(),
    healthCheck
  };
});