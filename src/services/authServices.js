/**
 * Сервіси для аутентифікації та управління користувачами
 * Використовує Sequelize для роботи з моделлю User в PostgreSQL
 *
 * @fileoverview Authentication and user management services
 * @module authServices
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

const { JWT_SECRET } = process.env;

/**
 * Створює нового користувача з хешованим паролем
 * Використовує bcrypt для хешування пароля та Sequelize для збереження
 *
 * @async
 * @function registerUser
 * @param {Object} userData - Дані користувача для реєстрації
 * @param {string} userData.email - Email адреса користувача
 * @param {string} userData.password - Пароль користувача
 * @returns {Promise<Object>} Створений користувач без пароля
 * @throws {Error} - Помилки валідації або роботи з базою даних
 *
 * @example
 * const user = await registerUser({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * console.log(user.email); // 'user@example.com'
 */
export const registerUser = async (userData) => {
  const { email, password } = userData;

  // Перевіряємо, чи існує користувач з таким email
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw HttpError(409, 'Email in use');
  }

  // Хешуємо пароль
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Генеруємо токен верифікації
  const verificationToken = nanoid();

  // Створюємо користувача
  const user = await User.create({
    email,
    password: hashedPassword,
    subscription: 'starter',
    verify: false,
    verificationToken
  });

  // ВАЖЛИВО: authServices.registerUser НЕ відправляє email
  // Це внутрішня функція для створення користувача
  // Email відправляється в контролері register

  // Повертаємо користувача без пароля та токена
  const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user.toJSON();
  return userWithoutSensitiveData;
};

/**
 * Аутентифікує користувача та повертає JWT токен
 * Порівнює хешований пароль та створює токен для успішної аутентифікації
 *
 * @async
 * @function loginUser
 * @param {Object} userData - Дані користувача для входу
 * @param {string} userData.email - Email адреса користувача
 * @param {string} userData.password - Пароль користувача
 * @returns {Promise<Object>} Об'єкт з токеном та даними користувача
 * @throws {Error} - Помилки аутентифікації або роботи з базою даних
 *
 * @example
 * const result = await loginUser({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * console.log(result.token); // JWT токен
 * console.log(result.user.email); // 'user@example.com'
 */
export const loginUser = async (userData) => {
  const { email, password } = userData;

  // Знаходимо користувача за email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }

  // Перевіряємо пароль
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw HttpError(401, 'Email or password is wrong');
  }

  // Перевіряємо верифікацію
  if (!user.verify) {
    throw HttpError(401, 'Email not verified');
  }

  // Створюємо JWT токен
  const payload = {
    id: user.id,
    email: user.email
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  // Зберігаємо токен в базі даних
  await user.update({ token });

  // Повертаємо токен та дані користувача без чутливих даних
  const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user.toJSON();
  return {
    token,
    user: userWithoutSensitiveData
  };
};

/**
 * Видаляє токен користувача (вихід з системи)
 * Очищає токен в базі даних для безпечного виходу
 *
 * @async
 * @function logoutUser
 * @param {number} userId - ID користувача для виходу
 * @returns {Promise<void>} Успішний вихід
 * @throws {Error} - Помилки роботи з базою даних
 *
 * @example
 * await logoutUser(123);
 * // Користувач успішно вийшов з системи
 */
export const logoutUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(401, 'Not authorized');
  }

  // Видаляємо токен
  await user.update({ token: null });
};

/**
 * Отримує дані поточного користувача за ID
 * Повертає інформацію про користувача без пароля
 *
 * @async
 * @function getCurrentUser
 * @param {number} userId - ID користувача
 * @returns {Promise<Object>} Дані користувача без пароля
 * @throws {Error} - Помилки роботи з базою даних
 *
 * @example
 * const user = await getCurrentUser(123);
 * console.log(user.email); // 'user@example.com'
 * console.log(user.subscription); // 'starter'
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(401, 'Not authorized');
  }

  // Повертаємо користувача без чутливих даних
  const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user.toJSON();
  return userWithoutSensitiveData;
};

/**
 * Оновлює підписку користувача
 * Змінює тип підписки на один з дозволених: starter, pro, business
 *
 * @async
 * @function updateUserSubscription
 * @param {number} userId - ID користувача
 * @param {string} subscription - Новий тип підписки
 * @returns {Promise<Object>} Оновлені дані користувача без пароля
 * @throws {Error} - Помилки валідації або роботи з базою даних
 *
 * @example
 * const user = await updateUserSubscription(123, 'pro');
 * console.log(user.subscription); // 'pro'
 */
export const updateUserSubscription = async (userId, subscription) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw HttpError(401, 'Not authorized');
  }

  // Оновлюємо підписку
  await user.update({ subscription });

  // Повертаємо користувача без чутливих даних
  const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user.toJSON();
  return userWithoutSensitiveData;
}; 