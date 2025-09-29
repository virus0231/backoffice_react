/**
 * Database Error Handling Middleware
 * Provides graceful error handling and degradation for database operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseError, ConnectionError, ValidationError, TimeoutError } from 'sequelize';
import { logger, sanitizeQueryParams } from './logger';

// Error types for classification
export enum DatabaseErrorType {
  CONNECTION = 'CONNECTION',
  QUERY = 'QUERY',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// Error response interface
export interface DatabaseErrorResponse {
  success: false;
  error: string;
  message: string;
  type: DatabaseErrorType;
  timestamp: string;
  requestId?: string;
}

/**
 * Classifies Sequelize errors into standard error types
 */
export function classifyDatabaseError(error: any): DatabaseErrorType {
  if (error instanceof ConnectionError) {
    return DatabaseErrorType.CONNECTION;
  }

  if (error instanceof ValidationError) {
    return DatabaseErrorType.VALIDATION;
  }

  if (error instanceof TimeoutError) {
    return DatabaseErrorType.TIMEOUT;
  }

  if (error instanceof DatabaseError) {
    return DatabaseErrorType.QUERY;
  }

  return DatabaseErrorType.UNKNOWN;
}

/**
 * Creates standardized error response
 */
export function createErrorResponse(
  error: any,
  requestId?: string
): DatabaseErrorResponse {
  const errorType = classifyDatabaseError(error);
  let message = 'A database error occurred';
  let userMessage = 'An error occurred while processing your request';

  switch (errorType) {
    case DatabaseErrorType.CONNECTION:
      message = 'Database connection failed';
      userMessage = 'Unable to connect to the database. Please try again later.';
      break;
    case DatabaseErrorType.QUERY:
      message = 'Database query failed';
      userMessage = 'An error occurred while retrieving data. Please try again.';
      break;
    case DatabaseErrorType.VALIDATION:
      message = 'Data validation failed';
      userMessage = 'Invalid data provided. Please check your input and try again.';
      break;
    case DatabaseErrorType.TIMEOUT:
      message = 'Database query timeout';
      userMessage = 'The request took too long to process. Please try again.';
      break;
  }

  return {
    success: false,
    error: message,
    message: userMessage,
    type: errorType,
    timestamp: new Date().toISOString(),
    requestId
  };
}

/**
 * Logs database errors with sanitized parameters
 */
export function logDatabaseError(
  error: any,
  context: {
    operation?: string;
    query?: string;
    parameters?: any;
    requestId?: string;
    userId?: string;
    appealId?: string | null;
    appealIds?: string | null;
  } = {}
): void {
  const errorType = classifyDatabaseError(error);

  logger.error('Database operation failed', {
    errorType,
    errorMessage: error.message,
    errorStack: error.stack,
    operation: context.operation,
    query: context.query,
    parameters: sanitizeQueryParams(context.parameters),
    requestId: context.requestId,
    userId: context.userId,
    appealId: context.appealId,
    appealIds: context.appealIds
  });
}

/**
 * Database operation wrapper with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    operationName: string;
    requestId?: string;
    userId?: string;
  }
): Promise<{ success: true; data: T } | DatabaseErrorResponse> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    logDatabaseError(error, {
      operation: context.operationName,
      requestId: context.requestId,
      userId: context.userId
    });

    return createErrorResponse(error, context.requestId);
  }
}

/**
 * API route middleware for database error handling
 */
export function withDatabaseMiddleware(
  handler: (request: NextRequest) => Promise<any>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(request);
      return NextResponse.json(result);
    } catch (error) {
      const requestId = crypto.randomUUID();

      logDatabaseError(error, {
        operation: 'API Request',
        requestId,
        query: request.url
      });

      const errorResponse = createErrorResponse(error, requestId);

      // Return appropriate HTTP status code
      let statusCode = 500;
      switch (errorResponse.type) {
        case DatabaseErrorType.CONNECTION:
          statusCode = 503; // Service Unavailable
          break;
        case DatabaseErrorType.VALIDATION:
          statusCode = 400; // Bad Request
          break;
        case DatabaseErrorType.TIMEOUT:
          statusCode = 408; // Request Timeout
          break;
        case DatabaseErrorType.QUERY:
          statusCode = 500; // Internal Server Error
          break;
        default:
          statusCode = 500;
      }

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  };
}

/**
 * Health check for database connection with graceful degradation
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  details?: any;
}> {
  try {
    const { testDatabaseConnection } = await import('./sequelize');
    const isConnected = await testDatabaseConnection();

    if (isConnected) {
      return {
        healthy: true,
        message: 'Database connection is healthy'
      };
    } else {
      return {
        healthy: false,
        message: 'Database connection failed',
        details: 'Unable to establish connection to database'
      };
    }
  } catch (error) {
    logger.error('Database health check failed', { error });

    return {
      healthy: false,
      message: 'Database health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Graceful degradation handler for when database is unavailable
 */
export function handleDatabaseUnavailable(
  requestType: 'analytics' | 'data' | 'export' = 'data'
): DatabaseErrorResponse {
  const message = 'Database is currently unavailable';
  let userMessage = 'The service is temporarily unavailable. Please try again later.';

  switch (requestType) {
    case 'analytics':
      userMessage = 'Analytics data is temporarily unavailable. Please check back in a few minutes.';
      break;
    case 'export':
      userMessage = 'Data export is temporarily unavailable. Please try again later.';
      break;
  }

  return {
    success: false,
    error: message,
    message: userMessage,
    type: DatabaseErrorType.CONNECTION,
    timestamp: new Date().toISOString()
  };
}