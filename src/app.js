/**
 * Express.js застосунок - конфігурація та middleware
 * Не містить логіку запуску сервера - тільки налаштування Express app
 *
 * @fileoverview Express application configuration
 * @module app
 * @author GoIT Student
 * @version 1.0.0 - Clean architecture approach
 * @license GPL-3.0
 */

import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import contactsRouter from "./routes/contactsRouter.js";

const app = express();

// 🛡️ Безпека HTTP заголовків
app.use(helmet());

// 📝 HTTP логування
app.use(morgan("tiny"));

// 🌐 CORS middleware
app.use(cors());

// 📄 JSON парсинг
app.use(express.json());

// 🚀 API роути для контактів
app.use("/api/contacts", contactsRouter);

// 🚨 Глобальний обробник помилок (повертає JSON замість HTML)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { status = 500, message = "Внутрішня помилка сервера" } = err;
  res.status(status).json({
    message
  });
});

// ❌ Обробка 404 для невідомих роутів
app.use((req, res) => {
  res.status(404).json({
    message: `Роут ${req.originalUrl} не знайдено`
  });
});

export default app;
