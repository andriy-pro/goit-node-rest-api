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
import { registerSchema, loginSchema, subscriptionSchema, resendVerificationSchema } from '../schemas/authSchemas.js';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authControllers.js';
import { updateAvatar } from '../controllers/avatarController.js';
import upload from '../middlewares/upload.js';

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

/**
 * PATCH /api/auth/avatars
 * Оновлення аватара користувача (потребує аутентифікації)
 * Headers: Authorization: Bearer <token>
 * Content-Type: multipart/form-data
 * Body: avatar file (JPEG, PNG, GIF, WebP, max 5MB)
 * Response: { avatarURL: string }
 */
router.patch(
  '/avatars',
  authenticateToken,
  upload.single('avatar'),
  updateAvatar
);

/**
 * GET /api/auth/verify/:verificationToken
 * Верифікація email користувача
 * Params: verificationToken
 * Response: { message: "Verification successful" }
 */
router.get("/verify/:verificationToken", verifyEmail);

/**
 * POST /api/auth/verify
 * Повторна відправка email верифікації
 * Body: { email }
 * Response: { message: "Verification email sent" }
 */
router.post(
  "/verify",
  validateBody(resendVerificationSchema),
  resendVerificationEmail
);

export default router;
