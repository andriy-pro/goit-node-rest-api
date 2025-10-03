/**
 * Middleware для завантаження файлів за допомогою Multer
 * Обробляє multipart/form-data запити для завантаження аватарів
 *
 * @fileoverview Multer middleware for file uploads
 * @module upload
 * @author Andriy Nechyporenko
 * @version 1.0.0 - Topic 9: Avatar Upload
 * @license GPL-3.0
 */

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import HttpError from "../helpers/HttpError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Налаштування зберігання файлів
 * Файли тимчасово зберігаються в папці temp з унікальними іменами
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../temp"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

/**
 * Фільтр для перевірки типу файлу
 * Дозволяє тільки зображення: JPEG, PNG, GIF, WebP
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Повертаємо помилку як HttpError для єдиної обробки
    cb(
      HttpError(
        400,
        "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed."
      ),
      false
    );
  }
};

/**
 * Налаштування multer
 * - Зберігання в temp директорії
 * - Валідація типу файлу
 * - Максимальний розмір файлу: 5MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;

