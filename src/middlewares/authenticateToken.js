/**
 * Middleware для аутентифікації JWT токенів
 * Перевіряє токен з заголовка Authorization та додає користувача до req.user
 *
 * @fileoverview JWT authentication middleware
 * @module authenticateToken
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware для перевірки JWT токена
 * 
 * @function authenticateToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @example
 * router.get('/protected', authenticateToken, (req, res) => {
 *   // req.user містить дані користувача
 *   res.json({ user: req.user });
 * });
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Отримуємо токен з заголовка Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw HttpError(401, 'Not authorized');
    }

    // Перевіряємо токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Знаходимо користувача за id з токена
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw HttpError(401, 'Not authorized');
    }

    // Перевіряємо, чи токен збігається з тим, що в базі
    if (!user.token || user.token !== token) {
      throw HttpError(401, 'Not authorized');
    }

    // Додаємо користувача до req.user
    req.user = {
      id: user.id,
      email: user.email,
      subscription: user.subscription
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(HttpError(401, 'Not authorized'));
    }
    next(error);
  }
};

export default authenticateToken; 