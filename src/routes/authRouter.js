/**
 * Маршрути для аутентифікації користувачів
 * Обробляє реєстрацію, вхід, вихід та управління користувачами
 *
 * @fileoverview Authentication routes for user management
 * @module authRouter
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import express from 'express';
import validateBody from '../helpers/validateBody.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { registerSchema, loginSchema, subscriptionSchema } from '../schemas/authSchemas.js';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateSubscription
} from '../controllers/authControllers.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Реєстрація нового користувача
 * Body: { email, password }
 * Response: { user: { email, subscription } }
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * POST /api/auth/login
 * Вхід користувача
 * Body: { email, password }
 * Response: { token, user: { email, subscription } }
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * POST /api/auth/logout
 * Вихід користувача (потребує аутентифікації)
 * Headers: Authorization: Bearer <token>
 * Response: 204 No Content
 */
router.post('/logout', authenticateToken, logout);

/**
 * GET /api/auth/current
 * Отримання поточного користувача (потребує аутентифікації)
 * Headers: Authorization: Bearer <token>
 * Response: { email, subscription }
 */
router.get('/current', authenticateToken, getCurrentUser);

/**
 * PATCH /api/auth/subscription
 * Оновлення підписки користувача (потребує аутентифікації)
 * Headers: Authorization: Bearer <token>
 * Body: { subscription }
 * Response: { email, subscription }
 */
router.patch('/subscription', authenticateToken, validateBody(subscriptionSchema), updateSubscription);

export default router; 