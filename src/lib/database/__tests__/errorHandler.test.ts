/**
 * Error Handler Tests
 * Tests database error classification, handling, and middleware
 */

import {
  classifyDatabaseError,
  createErrorResponse,
  withDatabaseErrorHandling,
  checkDatabaseHealth,
  handleDatabaseUnavailable,
  DatabaseErrorType
} from '../errorHandler';
import { ConnectionError, ValidationError, TimeoutError, DatabaseError } from 'sequelize';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  },
  sanitizeQueryParams: jest.fn((params) => params)
}));

// Mock sequelize for health check
jest.mock('../sequelize', () => ({
  testDatabaseConnection: jest.fn()
}));

describe('Error Handler', () => {
  describe('classifyDatabaseError', () => {
    test('should classify ConnectionError correctly', () => {
      const error = new ConnectionError(new Error('Connection failed'));
      const type = classifyDatabaseError(error);
      expect(type).toBe(DatabaseErrorType.CONNECTION);
    });

    test('should classify ValidationError correctly', () => {
      const error = new ValidationError('Validation failed', []);
      const type = classifyDatabaseError(error);
      expect(type).toBe(DatabaseErrorType.VALIDATION);
    });

    test('should classify TimeoutError correctly', () => {
      const error = new TimeoutError(new Error('Query timeout'));
      const type = classifyDatabaseError(error);
      expect(type).toBe(DatabaseErrorType.TIMEOUT);
    });

    test('should classify generic DatabaseError correctly', () => {
      const error = new DatabaseError(new Error('Database error'));
      const type = classifyDatabaseError(error);
      expect(type).toBe(DatabaseErrorType.QUERY);
    });

    test('should classify unknown error correctly', () => {
      const error = new Error('Unknown error');
      const type = classifyDatabaseError(error);
      expect(type).toBe(DatabaseErrorType.UNKNOWN);
    });
  });

  describe('createErrorResponse', () => {
    test('should create connection error response', () => {
      const error = new ConnectionError(new Error('Connection failed'));
      const response = createErrorResponse(error, 'req-123');

      expect(response).toEqual({
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String),
        requestId: 'req-123'
      });
    });

    test('should create validation error response', () => {
      const error = new ValidationError('Validation failed', []);
      const response = createErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Data validation failed',
        message: 'Invalid data provided. Please check your input and try again.',
        type: DatabaseErrorType.VALIDATION,
        timestamp: expect.any(String),
        requestId: undefined
      });
    });

    test('should create timeout error response', () => {
      const error = new TimeoutError(new Error('Query timeout'));
      const response = createErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Database query timeout',
        message: 'The request took too long to process. Please try again.',
        type: DatabaseErrorType.TIMEOUT,
        timestamp: expect.any(String),
        requestId: undefined
      });
    });

    test('should create query error response', () => {
      const error = new DatabaseError(new Error('Query failed'));
      const response = createErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'Database query failed',
        message: 'An error occurred while retrieving data. Please try again.',
        type: DatabaseErrorType.QUERY,
        timestamp: expect.any(String),
        requestId: undefined
      });
    });

    test('should create unknown error response', () => {
      const error = new Error('Unknown error');
      const response = createErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: 'A database error occurred',
        message: 'An error occurred while processing your request',
        type: DatabaseErrorType.UNKNOWN,
        timestamp: expect.any(String),
        requestId: undefined
      });
    });

    test('should include valid timestamp in ISO format', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);

      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });
  });

  describe('withDatabaseErrorHandling', () => {
    test('should return success result when operation succeeds', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success data');

      const result = await withDatabaseErrorHandling(mockOperation, {
        operationName: 'test operation',
        requestId: 'req-123'
      });

      expect(result).toEqual({
        success: true,
        data: 'success data'
      });
      expect(mockOperation).toHaveBeenCalled();
    });

    test('should return error response when operation fails', async () => {
      const mockError = new ConnectionError(new Error('Connection failed'));
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      const result = await withDatabaseErrorHandling(mockOperation, {
        operationName: 'test operation',
        requestId: 'req-123'
      });

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String),
        requestId: 'req-123'
      });
    });

    test('should handle async operations correctly', async () => {
      const mockOperation = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });

      const result = await withDatabaseErrorHandling(mockOperation, {
        operationName: 'async operation'
      });

      expect(result).toEqual({
        success: true,
        data: 'async result'
      });
    });
  });

  describe('checkDatabaseHealth', () => {
    const { testDatabaseConnection } = require('../sequelize');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return healthy status when connection succeeds', async () => {
      testDatabaseConnection.mockResolvedValue(true);

      const result = await checkDatabaseHealth();

      expect(result).toEqual({
        healthy: true,
        message: 'Database connection is healthy'
      });
    });

    test('should return unhealthy status when connection fails', async () => {
      testDatabaseConnection.mockResolvedValue(false);

      const result = await checkDatabaseHealth();

      expect(result).toEqual({
        healthy: false,
        message: 'Database connection failed',
        details: 'Unable to establish connection to database'
      });
    });

    test('should handle connection test exceptions', async () => {
      const testError = new Error('Connection test failed');
      testDatabaseConnection.mockRejectedValue(testError);

      const result = await checkDatabaseHealth();

      expect(result).toEqual({
        healthy: false,
        message: 'Database health check failed',
        details: 'Connection test failed'
      });
    });
  });

  describe('handleDatabaseUnavailable', () => {
    test('should return appropriate message for analytics requests', () => {
      const response = handleDatabaseUnavailable('analytics');

      expect(response).toEqual({
        success: false,
        error: 'Database is currently unavailable',
        message: 'Analytics data is temporarily unavailable. Please check back in a few minutes.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String)
      });
    });

    test('should return appropriate message for export requests', () => {
      const response = handleDatabaseUnavailable('export');

      expect(response).toEqual({
        success: false,
        error: 'Database is currently unavailable',
        message: 'Data export is temporarily unavailable. Please try again later.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String)
      });
    });

    test('should return default message for general data requests', () => {
      const response = handleDatabaseUnavailable('data');

      expect(response).toEqual({
        success: false,
        error: 'Database is currently unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String)
      });
    });

    test('should return default message when no request type specified', () => {
      const response = handleDatabaseUnavailable();

      expect(response).toEqual({
        success: false,
        error: 'Database is currently unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        type: DatabaseErrorType.CONNECTION,
        timestamp: expect.any(String)
      });
    });
  });

  describe('Error Response Validation', () => {
    test('should always include required fields in error response', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error, 'req-123');

      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('requestId');

      expect(typeof response.error).toBe('string');
      expect(typeof response.message).toBe('string');
      expect(Object.values(DatabaseErrorType)).toContain(response.type);
      expect(typeof response.timestamp).toBe('string');
    });

    test('should handle null and undefined errors gracefully', () => {
      const nullError = null as any;
      const undefinedError = undefined as any;

      expect(() => createErrorResponse(nullError)).not.toThrow();
      expect(() => createErrorResponse(undefinedError)).not.toThrow();
    });
  });
});