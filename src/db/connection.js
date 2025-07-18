/**
 * Підключення до PostgreSQL через Sequelize
 * Забезпечує підключення до хмарної бази даних та обробку помилок
 *
 * @fileoverview Database connection configuration for PostgreSQL
 * @module connection
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { Sequelize } from 'sequelize';

// Конфігурація підключення до PostgreSQL з підтримкою різних середовищ
const getDatabaseConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Базові налаштування - використовуємо одну БД для всіх середовищ
  const config = {
    database: process.env.DB_NAME || 'db-contacts',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: isDevelopment ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  };

  // SSL конфігурація для production та тестів (якщо DB_SSL=true)
  if (isProduction || process.env.DB_SSL === 'true') {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true,
      keepAliveInitialDelayMillis: 0
    };
  }

  return config;
};

const DB_CONFIG = getDatabaseConfig();

// Перевірка наявності обов'язкових змінних середовища (тільки для production)
const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !process.env.DB_PASSWORD) {
  console.error('\x1b[31m[ERROR] DB_PASSWORD не встановлено в production середовищі\x1b[0m');
    process.exit(1);
  }

  if (isProduction && !process.env.DB_NAME) {
  console.error('\x1b[31m[ERROR] DB_NAME не встановлено в production середовищі\x1b[0m');
    process.exit(1);
  }

  if (isProduction && !process.env.DB_USER) {
  console.error('\x1b[31m[ERROR] DB_USER не встановлено в production середовищі\x1b[0m');
    process.exit(1);
  }
};

validateEnvironment();

// Створення екземпляру Sequelize
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    dialect: DB_CONFIG.dialect,
    logging: DB_CONFIG.logging,
    pool: DB_CONFIG.pool,
    dialectOptions: DB_CONFIG.dialectOptions
  }
);

/**
 * Тестування підключення до бази даних
 * Виводить повідомлення про успіх або помилку згідно з завданням
 *
 * @async
 * @function testConnection
 * @returns {Promise<void>}
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Синхронізація моделей з базою даних
 * Створює таблиці якщо вони не існують
 *
 * @async
 * @function syncDatabase
 * @param {Object} options - Опції синхронізації
 * @returns {Promise<void>}
 */
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Models are synchronized with the database');
  } catch (error) {
    console.error('Model synchronization error:', error.message);
    throw error;
  }
};

export default sequelize;
