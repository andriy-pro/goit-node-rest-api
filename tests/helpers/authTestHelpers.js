/**
 * Helper функції для тестів аутентифікації
 * Зменшує дублювання коду та покращує підтримку тестів
 *
 * @fileoverview Authentication test helpers
 * @module authTestHelpers
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Створює тестового користувача з хешованим паролем
 * @param {Object} options - Опції для створення користувача
 * @returns {Promise<User>} Створений користувач
 */
export const createTestUser = async (options = {}) => {
  const {
    email = `test-${Date.now()}@example.com`,
    password = 'testpassword',
    subscription = 'starter',
    verify = true, // За замовчуванням тестові користувачі верифіковані
    verificationToken = null, // Верифіковані користувачі не мають токена
    rounds = 1 // Швидше для тестів
  } = options;

  const hashedPassword = await bcrypt.hash(password, rounds);
  
  return await User.create({
    email,
    password: hashedPassword,
    subscription,
    verify,
    verificationToken
  });
};

/**
 * Створює JWT токен для тестового користувача
 * @param {User} user - Користувач
 * @param {Object} options - Опції токена
 * @returns {string} JWT токен
 */
export const createAuthToken = (user, options = {}) => {
  const {
    expiresIn = '24h',
    additionalData = {}
  } = options;

  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      ...additionalData
    },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Створює неверифікованого тестового користувача
 * @param {Object} options - Опції для створення користувача
 * @returns {Promise<User>} Створений неверифікований користувач
 */
export const createUnverifiedTestUser = async (options = {}) => {
  const { nanoid } = await import('nanoid');
  
  return await createTestUser({
    ...options,
    verify: false,
    verificationToken: nanoid()
  });
};

/**
 * Створює повністю налаштованого тестового користувача з токеном
 * @param {Object} options - Опції для створення
 * @returns {Promise<{user: User, token: string, password: string}>}
 */
export const createAuthenticatedUser = async (options = {}) => {
  const { password = 'testpassword' } = options;
  
  const user = await createTestUser({ ...options, password });
  const token = createAuthToken(user);
  
  // Зберігаємо токен в базі
  await user.update({ token });
  
  return { user, token, password };
};

/**
 * Тестує валідацію обов'язкових полів
 * @param {Function} requestFn - Функція для виконання запиту
 * @param {string} fieldName - Назва поля для тестування
 * @param {string} expectedError - Очікувана помилка
 */
export const testRequiredField = async (requestFn, fieldName, expectedError) => {
  const testData = {};
  
  const response = await requestFn(testData);
  
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toMatch(new RegExp(expectedError, 'i'));
};

/**
 * Тестує успішну відповідь аутентифікації
 * @param {Object} response - Відповідь сервера
 * @param {string} expectedEmail - Очікуваний email
 * @param {string} expectedSubscription - Очікувана підписка
 */
export const testSuccessfulAuthResponse = (response, expectedEmail, expectedSubscription = 'starter') => {
  expect(response.body).toHaveProperty('user');
  expect(response.body.user).toHaveProperty('email', expectedEmail);
  expect(response.body.user).toHaveProperty('subscription', expectedSubscription);
  expect(response.body.user).not.toHaveProperty('password');
  expect(response.body.user).not.toHaveProperty('token');
  expect(response.body.user).not.toHaveProperty('id');
};

/**
 * Тестує помилку аутентифікації
 * @param {Object} response - Відповідь сервера
 * @param {number} expectedStatus - Очікуваний статус
 * @param {string} expectedMessage - Очікуване повідомлення
 */
export const testAuthError = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('message', expectedMessage);
};

/**
 * Тестує JWT токен
 * @param {string} token - JWT токен
 */
export const testJWTToken = (token) => {
  expect(token).toBeDefined();
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(50);
};

/**
 * Тестові дані для валідації
 */
export const VALIDATION_TEST_CASES = {
  missingEmail: {
    data: { password: 'testpassword' },
    expectedError: 'email'
  },
  missingPassword: {
    data: { email: 'test@example.com' },
    expectedError: 'password'
  },
  invalidEmail: {
    data: { email: 'invalid-email', password: 'testpassword' },
    expectedError: 'valid email'
  },
  shortPassword: {
    data: { email: 'test@example.com', password: '123' },
    expectedError: 'password'
  },
  emptyBody: {
    data: {},
    expectedError: 'required'
  }
}; 