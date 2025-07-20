/**
 * Ініціалізація та експорт всіх Sequelize моделей
 * Централізоване управління моделями проекту
 *
 * @fileoverview Models initialization and export
 * @module models
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import sequelize, { testConnection, syncDatabase } from '../db/connection.js';
import Contact from './Contact.js';
import User from './User.js';

// Об'єкт з усіма моделями для зручного імпорту
const models = {
  Contact,
  User,
  sequelize,
  testConnection,
  syncDatabase
};

/**
 * Налаштування зв'язків між моделями
 */
const setupAssociations = () => {
  // User has many Contacts (one-to-many)
  User.hasMany(Contact, {
    foreignKey: 'owner',
    as: 'contacts',
    onDelete: 'CASCADE'
  });

  // Contact belongs to User (many-to-one)
  Contact.belongsTo(User, {
    foreignKey: 'owner',
    as: 'user'
  });
};

/**
 * Ініціалізація всіх моделей та їх зв'язків
 * Виконується при запуску додатка
 *
 * @async
 * @function initializeModels
 * @returns {Promise<void>}
 */
export const initializeModels = async () => {
  try {
    // Налаштовуємо зв'язки між моделями
    setupAssociations();

    // Тестування підключення
    await testConnection();

    // Синхронізація моделей з БД
    await syncDatabase({
      alter: process.env.NODE_ENV === 'development',
      force: false // НІКОЛИ не видаляти таблиці в production
    });

    console.log('Всі моделі успішно ініціалізовані');
  } catch (error) {
    console.error('Помилка ініціалізації моделей:', error.message);
    process.exit(1);
  }
};

// Експорт моделей
export { Contact, User };
export default models;
