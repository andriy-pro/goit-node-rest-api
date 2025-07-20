/**
 * Контролери для аутентифікації користувачів
 * Обробляє реєстрацію, вхід, вихід та отримання поточного користувача
 *
 * @fileoverview Authentication controllers for user management
 * @module authControllers
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Реєстрація нового користувача
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Перевіряємо, чи користувач вже існує
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, 'Email in use');
    }

    // Хешуємо пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Створюємо нового користувача
    const user = await User.create({
      email,
      password: hashedPassword,
      subscription: 'starter' // значення за замовчуванням
    });

    // Повертаємо дані користувача (без пароля та токена)
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вхід користувача
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

    // Генеруємо JWT токен
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Зберігаємо токен в базі даних
    await user.update({ token });

    // Повертаємо токен та дані користувача
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вихід користувача
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { id } = req.user;

    // Знаходимо користувача та видаляємо токен
    const user = await User.findByPk(id);
    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    await user.update({ token: null });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Отримання поточного користувача
 * GET /api/auth/current
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const { id } = req.user;

    // Знаходимо користувача
    const user = await User.findByPk(id);
    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    // Повертаємо дані користувача
    res.json({
      email: user.email,
      subscription: user.subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Оновлення підписки користувача
 * PATCH /api/auth/subscription
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { subscription } = req.body;

    // Знаходимо користувача та оновлюємо підписку
    const user = await User.findByPk(id);
    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    await user.update({ subscription });

    // Повертаємо оновлені дані користувача
    res.json({
      email: user.email,
      subscription: user.subscription
    });
  } catch (error) {
    next(error);
  }
}; 