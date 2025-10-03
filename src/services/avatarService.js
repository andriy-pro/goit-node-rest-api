/**
 * Сервіс для обробки аватарів користувачів
 * Обробляє завантажені файли та управляє збереженням аватарів
 *
 * @fileoverview Avatar processing service
 * @module avatarService
 * @author Andriy Nechyporenko
 * @version 1.0.0 - Topic 9: Avatar Upload
 * @license GPL-3.0
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, "../../public/avatars");
const tempDir = path.join(__dirname, "../../temp");

/**
 * Обробляє завантажений аватар: переміщує з temp до public/avatars
 * @param {string} tempFilePath - Шлях до тимчасового файлу
 * @param {number} userId - ID користувача
 * @returns {Promise<string>} URL аватара (відносний шлях /avatars/filename.ext)
 * 
 * @example
 * const avatarURL = await processAvatar('/temp/avatar-123.jpg', 42);
 * // Returns: '/avatars/user-42-abc123.jpg'
 */
export const processAvatar = async (tempFilePath, userId) => {
  try {
    const ext = path.extname(tempFilePath);
    const filename = `user-${userId}-${nanoid()}${ext}`;
    const newPath = path.join(avatarsDir, filename);

    // Переміщення файлу з temp до public/avatars
    await fs.rename(tempFilePath, newPath);

    // Повернення відносного URL для зберігання в БД
    return `/avatars/${filename}`;
  } catch (error) {
    // Видалення тимчасового файлу у разі помилки
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      console.error("Error deleting temp file:", unlinkError);
    }
    throw error;
  }
};

/**
 * Видаляє старий аватар користувача (якщо це локальний файл)
 * Не видаляє зовнішні URL (наприклад, Gravatar)
 * @param {string} avatarURL - URL старого аватара
 * 
 * @example
 * await deleteOldAvatar('/avatars/user-42-old.jpg'); // видалить
 * await deleteOldAvatar('https://gravatar.com/...'); // пропустить
 */
export const deleteOldAvatar = async (avatarURL) => {
  // Не видаляємо Gravatar або зовнішні URL
  if (!avatarURL || avatarURL.startsWith("http")) {
    return;
  }

  try {
    const filename = path.basename(avatarURL);
    const filePath = path.join(avatarsDir, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error deleting old avatar:", error);
    // Не кидаємо помилку, якщо файл не знайдено
  }
};

