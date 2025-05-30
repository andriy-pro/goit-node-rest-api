/**
 * Головний файл Express.js застосунку
 * Налаштовує middleware, роути та обробку помилок
 *
 * @fileoverview Main Express application setup
 * @module app
 * @author GoIT Student
 * @version 1.0.0 - Simple and clean implementation
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

// 🚀 Запуск сервера (тільки коли запускається напряму, не через тести)
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Перевіряємо чи це НЕ тестове середовище та файл запускається напряму
if (process.env.NODE_ENV !== 'test' &&
    process.argv[1] &&
    process.argv[1].endsWith('/src/app.js')) {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log(`🌐 Local access: http://localhost:${PORT}/api/contacts`);
    console.log(`🌍 Network access: http://[your-ip]:${PORT}/api/contacts`);
    console.log(`📋 Ready for development and production!`);
  });
}

export default app;
