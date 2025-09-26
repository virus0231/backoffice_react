/**
 * Database Health Monitoring
 * Monitors database connection status and performance metrics
 */

import { getSequelizeInstance, getConnectionPoolStatus } from './sequelize';
import { logger } from './logger';
import { checkDatabaseHealth } from './errorHandler';

// Health check result interface
export interface HealthCheckResult {
  timestamp: string;
  healthy: boolean;
  connectionPool: {
    size: number;
    available: number;
    used: number;
    pending: number;
  };
  latency?: number;
  error?: string;
}

// Performance metrics interface
export interface PerformanceMetrics {
  connectionPoolUsage: number;
  averageQueryTime: number;
  slowQueries: number;
  totalQueries: number;
  uptime: number;
}

class DatabaseHealthMonitor {
  private isMonitoring = false;
  private healthHistory: HealthCheckResult[] = [];
  private startTime = Date.now();
  private queryMetrics = {
    totalQueries: 0,
    totalQueryTime: 0,
    slowQueries: 0
  };

  /**
   * Performs comprehensive database health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();

    try {
      const startTime = Date.now();

      // Test basic connection
      const healthResult = await checkDatabaseHealth();
      const latency = Date.now() - startTime;

      // Get connection pool status
      const poolStatus = getConnectionPoolStatus();

      const result: HealthCheckResult = {
        timestamp,
        healthy: healthResult.healthy,
        connectionPool: {
          size: poolStatus.pool?.size || 0,
          available: poolStatus.pool?.available || 0,
          used: poolStatus.pool?.used || 0,
          pending: poolStatus.pool?.pending || 0
        },
        latency
      };

      if (!healthResult.healthy) {
        result.error = healthResult.message;
      }

      // Store in history (keep last 100 checks)
      this.healthHistory.push(result);
      if (this.healthHistory.length > 100) {
        this.healthHistory.shift();
      }

      // Log significant status changes
      if (this.healthHistory.length > 1) {
        const previousResult = this.healthHistory[this.healthHistory.length - 2];
        if (previousResult && previousResult.healthy !== result.healthy) {
          if (result.healthy) {
            logger.info('Database connection restored', result);
          } else {
            logger.error('Database connection lost', result);
          }
        }
      }

      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        timestamp,
        healthy: false,
        connectionPool: {
          size: 0,
          available: 0,
          used: 0,
          pending: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthHistory.push(result);
      if (this.healthHistory.length > 100) {
        this.healthHistory.shift();
      }

      logger.error('Health check failed', { error });
      return result;
    }
  }

  /**
   * Gets recent health check history
   */
  getHealthHistory(limit = 10): HealthCheckResult[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Gets current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const poolStatus = getConnectionPoolStatus();
    const totalConnections = poolStatus.pool?.size || 1;
    const usedConnections = poolStatus.pool?.used || 0;

    return {
      connectionPoolUsage: (usedConnections / totalConnections) * 100,
      averageQueryTime: this.queryMetrics.totalQueries > 0
        ? this.queryMetrics.totalQueryTime / this.queryMetrics.totalQueries
        : 0,
      slowQueries: this.queryMetrics.slowQueries,
      totalQueries: this.queryMetrics.totalQueries,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Records query execution metrics
   */
  recordQueryExecution(duration: number): void {
    this.queryMetrics.totalQueries++;
    this.queryMetrics.totalQueryTime += duration;

    // Consider queries over 1 second as slow
    if (duration > 1000) {
      this.queryMetrics.slowQueries++;
      logger.warn('Slow query detected', {
        duration: `${duration}ms`,
        slowQueryCount: this.queryMetrics.slowQueries
      });
    }
  }

  /**
   * Starts continuous health monitoring
   */
  startMonitoring(intervalMs = 60000): void {
    if (this.isMonitoring) {
      logger.warn('Health monitoring already started');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting database health monitoring', { intervalMs });

    const monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitoringInterval);
        return;
      }

      await this.performHealthCheck();
    }, intervalMs);

    // Perform initial health check
    this.performHealthCheck();
  }

  /**
   * Stops health monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    logger.info('Stopped database health monitoring');
  }

  /**
   * Checks if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Gets database uptime status
   */
  getUptimeStatus(): {
    uptime: number;
    uptimeFormatted: string;
    healthyPercentage: number;
  } {
    const uptime = Date.now() - this.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    // Calculate healthy percentage from recent history
    const recentChecks = this.getHealthHistory(50);
    const healthyChecks = recentChecks.filter(check => check.healthy).length;
    const healthyPercentage = recentChecks.length > 0
      ? (healthyChecks / recentChecks.length) * 100
      : 100;

    return {
      uptime,
      uptimeFormatted,
      healthyPercentage
    };
  }
}

// Export singleton instance
export const databaseHealthMonitor = new DatabaseHealthMonitor();

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  // Start monitoring with 2-minute intervals in production
  setTimeout(() => {
    databaseHealthMonitor.startMonitoring(120000);
  }, 5000); // Wait 5 seconds before starting to allow app initialization
}