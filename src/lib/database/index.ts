/**
 * Database Module Index
 * Main entry point for all database-related functionality
 */

// Core database functionality
export { getDatabaseConfig, getConnectionString } from './connection';
export {
  createSequelizeInstance,
  getSequelizeInstance,
  testDatabaseConnection,
  closeDatabaseConnection,
  getConnectionPoolStatus
} from './sequelize';

// Database models
export {
  DonationModel,
  DonorModel,
  CampaignModel,
  FundModel
} from './models';

export type {
  DonationAttributes,
  DonorAttributes,
  CampaignAttributes,
  FundAttributes
} from './models';

// Query utilities
export {
  queryDonations,
  getDonationAggregations,
  getDonationsByTimePeriod,
  getFirstTimeDonors,
  getRecurringDonations,
  buildUniversalFilter,
  buildDateRangeFilter
} from './queryBuilder';

export type {
  UniversalFilter,
  DateRangeFilter
} from './queryBuilder';

// Error handling
export {
  withDatabaseErrorHandling,
  withDatabaseMiddleware,
  checkDatabaseHealth,
  handleDatabaseUnavailable,
  DatabaseErrorType
} from './errorHandler';

export type {
  DatabaseErrorResponse
} from './errorHandler';

// Logging
export {
  logger,
  sanitizeQueryParams,
  logQuery,
  logSlowQuery,
  logConnectionEvent
} from './logger';

// Health monitoring
export {
  databaseHealthMonitor
} from './healthMonitor';

export type {
  HealthCheckResult,
  PerformanceMetrics
} from './healthMonitor';

// Performance monitoring
export {
  performanceMonitor,
  SLOW_QUERY_THRESHOLD,
  VERY_SLOW_QUERY_THRESHOLD,
  QUERY_TIMEOUT_DEFAULT
} from './performanceMonitor';

export type {
  QueryPerformanceMetrics,
  PerformanceStatistics
} from './performanceMonitor';

// Initialize database models and associations
import './models';