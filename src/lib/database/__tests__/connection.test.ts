/**
 * Database Connection Tests
 * Tests database configuration, connection, and error handling
 */

import { getDatabaseConfig, getConnectionString } from '../connection';

// Mock environment variables for testing
const mockEnvVars = {
  DB_HOST: 'localhost',
  DB_NAME: 'test_database',
  DB_USER: 'test_user',
  DB_PASSWORD: 'test_password',
  DB_PORT: '3306',
  DB_POOL_MAX: '10',
  DB_POOL_MIN: '2',
  DB_POOL_IDLE: '10000',
  DB_QUERY_TIMEOUT: '30000'
};

describe('Database Connection Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ...mockEnvVars };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getDatabaseConfig', () => {
    test('should return valid configuration with all environment variables set', () => {
      const config = getDatabaseConfig();

      expect(config).toEqual({
        host: 'localhost',
        database: 'test_database',
        username: 'test_user',
        password: 'test_password',
        port: 3306,
        pool: {
          max: 10,
          min: 2,
          idle: 10000
        },
        queryTimeout: 30000
      });
    });

    test('should use default port when DB_PORT is not set', () => {
      delete process.env.DB_PORT;
      const config = getDatabaseConfig();
      expect(config.port).toBe(3306);
    });

    test('should use default pool settings when not specified', () => {
      delete process.env.DB_POOL_MAX;
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_IDLE;

      const config = getDatabaseConfig();
      expect(config.pool).toEqual({
        max: 10,
        min: 2,
        idle: 10000
      });
    });

    test('should throw error when required environment variables are missing', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_NAME;

      expect(() => getDatabaseConfig()).toThrow(
        'Missing required environment variables: DB_HOST, DB_NAME'
      );
    });

    test('should throw error when DB_HOST is empty', () => {
      process.env.DB_HOST = '   '; // whitespace only

      expect(() => getDatabaseConfig()).toThrow('DB_HOST cannot be empty');
    });

    test('should throw error when port is invalid', () => {
      process.env.DB_PORT = '99999';

      expect(() => getDatabaseConfig()).toThrow(
        'DB_PORT must be a valid port number (1-65535)'
      );
    });

    test('should throw error when pool max is less than min', () => {
      process.env.DB_POOL_MAX = '1';
      process.env.DB_POOL_MIN = '5';

      expect(() => getDatabaseConfig()).toThrow(
        'DB_POOL_MAX must be greater than or equal to DB_POOL_MIN'
      );
    });
  });

  describe('getConnectionString', () => {
    test('should return connection string with masked password by default', () => {
      const config = getDatabaseConfig();
      const connectionString = getConnectionString(config);

      expect(connectionString).toBe(
        'mysql://test_user:***@localhost:3306/test_database'
      );
    });

    test('should return connection string with actual password when maskPassword is false', () => {
      const config = getDatabaseConfig();
      const connectionString = getConnectionString(config, false);

      expect(connectionString).toBe(
        'mysql://test_user:test_password@localhost:3306/test_database'
      );
    });
  });
});