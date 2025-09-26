/**
 * Winston Logger Configuration for Database Operations
 * Provides structured logging for database connections, queries, and errors
 */

import winston from 'winston';

// Create logger instance with structured logging
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  defaultMeta: {
    service: 'database',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        })
      )
    }),

    // File transport for persistent logging
    new winston.transports.File({
      filename: '.ai/database-error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    new winston.transports.File({
      filename: '.ai/database-combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

/**
 * Sanitizes query parameters for logging (removes sensitive data)
 */
export function sanitizeQueryParams(params: any): any {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const sanitized = { ...params };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}

/**
 * Logs database query with sanitized parameters
 */
export function logQuery(sql: string, params?: any, timing?: number): void {
  logger.debug('Database Query Executed', {
    sql,
    parameters: sanitizeQueryParams(params),
    executionTime: timing ? `${timing}ms` : undefined
  });
}

/**
 * Logs database connection events
 */
export function logConnectionEvent(event: 'connect' | 'disconnect' | 'error', details?: any): void {
  const sanitizedDetails = sanitizeQueryParams(details);

  switch (event) {
    case 'connect':
      logger.info('Database connection established', sanitizedDetails);
      break;
    case 'disconnect':
      logger.info('Database connection closed', sanitizedDetails);
      break;
    case 'error':
      logger.error('Database connection error', sanitizedDetails);
      break;
  }
}

/**
 * Logs slow query warnings
 */
export function logSlowQuery(sql: string, timing: number, threshold = 1000): void {
  if (timing > threshold) {
    logger.warn('Slow query detected', {
      sql,
      executionTime: `${timing}ms`,
      threshold: `${threshold}ms`
    });
  }
}