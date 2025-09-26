/**
 * Sequelize Instance Configuration
 * Manages MySQL connection pooling and instance setup
 */

import { Sequelize, Options } from 'sequelize';
import { getDatabaseConfig, getConnectionString } from './connection';
import { logger } from './logger';

let sequelize: Sequelize | null = null;

/**
 * Creates and configures Sequelize instance with MySQL dialect
 */
export function createSequelizeInstance(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  const config = getDatabaseConfig();

  const sequelizeOptions: Options = {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: config.queryTimeout,
      acquireTimeout: config.queryTimeout,
      timeout: config.queryTimeout,
    },
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      idle: config.pool.idle,
      acquire: config.queryTimeout,
      evict: 1000,
    },
    logging: (sql: string, timing?: number) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Database Query', { sql, timing });
      }
    },
    logQueryParameters: process.env.NODE_ENV === 'development',
    benchmark: true,
    retry: {
      max: 3,
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
  };

  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    sequelizeOptions
  );

  logger.info('Sequelize instance created', {
    host: config.host,
    database: config.database,
    connectionString: getConnectionString(config, true)
  });

  return sequelize;
}

/**
 * Gets existing Sequelize instance or creates new one
 */
export function getSequelizeInstance(): Sequelize {
  if (!sequelize) {
    return createSequelizeInstance();
  }
  return sequelize;
}

/**
 * Tests database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const instance = getSequelizeInstance();
    await instance.authenticate();

    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to database', { error });
    return false;
  }
}

/**
 * Closes database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (sequelize) {
    try {
      await sequelize.close();
      logger.info('Database connection closed');
      sequelize = null;
    } catch (error) {
      logger.error('Error closing database connection', { error });
      throw error;
    }
  }
}

/**
 * Gets connection pool status
 */
export function getConnectionPoolStatus() {
  if (!sequelize) {
    return { connected: false, pool: null };
  }

  try {
    const pool = (sequelize.connectionManager as any).pool;
    return {
      connected: true,
      pool: {
        size: pool?.size || 0,
        available: pool?.available || 0,
        used: pool?.used || 0,
        pending: pool?.pending || 0,
      }
    };
  } catch (error) {
    logger.warn('Unable to get connection pool status', { error });
    return {
      connected: true,
      pool: {
        size: 0,
        available: 0,
        used: 0,
        pending: 0,
      }
    };
  }
}