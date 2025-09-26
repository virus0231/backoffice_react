/**
 * Database Connection Configuration
 * Manages environment variables and database connection settings
 */

export interface DatabaseConfig {
  host: string;
  database: string;
  username: string;
  password: string;
  port: number;
  pool: {
    max: number;
    min: number;
    idle: number;
  };
  queryTimeout: number;
}

/**
 * Validates required environment variables for database connection
 */
function validateEnvironment(): void {
  const required = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file and ensure all database configuration variables are set.'
    );
  }
}

/**
 * Validates database connection string format
 */
function validateConnectionFormat(config: DatabaseConfig): void {
  if (!config.host || config.host.trim() === '') {
    throw new Error('DB_HOST cannot be empty');
  }

  if (!config.database || config.database.trim() === '') {
    throw new Error('DB_NAME cannot be empty');
  }

  if (!config.username || config.username.trim() === '') {
    throw new Error('DB_USER cannot be empty');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('DB_PORT must be a valid port number (1-65535)');
  }

  if (config.pool.max < config.pool.min) {
    throw new Error('DB_POOL_MAX must be greater than or equal to DB_POOL_MIN');
  }
}

/**
 * Gets database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  // Validate environment variables exist
  validateEnvironment();

  const config: DatabaseConfig = {
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
    },
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10)
  };

  // Validate connection format
  validateConnectionFormat(config);

  return config;
}

/**
 * Creates MySQL connection URL for debugging purposes (password masked)
 */
export function getConnectionString(config: DatabaseConfig, maskPassword = true): string {
  const password = maskPassword ? '***' : config.password;
  return `mysql://${config.username}:${password}@${config.host}:${config.port}/${config.database}`;
}