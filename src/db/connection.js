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

// Конфігурація підключення до PostgreSQL
const DB_CONFIG = {
  // URL підключення з змінних середовища або default для розробки
  database: process.env.DB_NAME || 'db-contacts',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,

  // Налаштування Sequelize
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // Налаштування пулу з'єднань
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  // SSL конфігурація для хмарних баз даних (Render завжди вимагає SSL)
  dialectOptions: (process.env.DB_SSL === 'false') ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

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
