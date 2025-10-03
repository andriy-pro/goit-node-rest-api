/**
 * Контролер для управління аватарами користувачів
 * Обробляє завантаження та оновлення аватарів
 *
 * @fileoverview Avatar controller for user avatar management
 * @module avatarController
 * @author Andriy Nechyporenko
 * @version 1.0.0 - Topic 9: Avatar Upload
 * @license GPL-3.0
 */

import fs from "fs/promises";
import { User } from "../models/index.js";
import {
  processAvatar,
  deleteOldAvatar,
} from "../services/avatarService.js";
import HttpError from "../helpers/HttpError.js";

/**
 * Оновлює аватар користувача
 * PATCH /api/auth/avatars
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user (from authenticateToken middleware)
 * @param {Object} req.file - Uploaded file (from multer middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * @returns {Object} JSON response with avatarURL
 * 
 * @example
 * // Success response:
 * { "avatarURL": "/avatars/user-42-abc123.jpg" }
 * 
 * @example
 * // Error response:
 * { "message": "Avatar file is required" }
 */
export const updateAvatar = async (req, res, next) => {
  try {
    // Перевірка наявності файлу
    if (!req.file) {
      throw HttpError(400, "Avatar file is required");
    }

    const userId = req.user.id;
    const tempFilePath = req.file.path;

    // Обробити новий аватар (переміщення з temp до public/avatars)
    const avatarURL = await processAvatar(tempFilePath, userId);

    // Отримати поточного користувача
    const user = await User.findByPk(userId);
    if (!user) {
      // Якщо користувач не знайдений, видалити завантажений файл
      await deleteOldAvatar(avatarURL);
      throw HttpError(401, "Not authorized");
    }

    const oldAvatarURL = user.avatarURL;

    // Оновити користувача в БД
    await user.update({ avatarURL });

    // Видалити старий аватар (якщо це не Gravatar)
    await deleteOldAvatar(oldAvatarURL);

    // Повернути новий avatarURL
    res.status(200).json({
      avatarURL,
    });
  } catch (error) {
    // Видалити temp файл при помилці
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }
    }
    next(error);
  }
};

