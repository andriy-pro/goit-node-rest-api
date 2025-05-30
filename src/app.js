/**
 * Головний файл Express.js застосунку
 * Налаштовує middleware, роути та обробку помилок
 *
 * @fileoverview Main Express application setup
 * @module app
 * @author Andriy Nechyporenko
 * @version 1.0.0
 */

import express from "express";
import morgan from "morgan";
import cors from "cors";

import contactsRouter from "./routes/contactsRouter.js";

const app = express();

// Логування HTTP запитів
app.use(morgan("tiny"));

// Middleware для CORS
app.use(cors());

// Middleware для парсингу JSON
app.use(express.json());

// API роути для контактів
app.use("/api/contacts", contactsRouter);

// Обробка 404 для невідомих роутів
app.use((req, res) => {
  res.status(404).json({
    message: `Роут ${req.originalUrl} не знайдено`
  });
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  const { status = 500, message = "Внутрішня помилка сервера" } = err;
  res.status(status).json({ message });
});

// Налаштування сервера
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Слухаємо на всіх інтерфейсах

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}/api/contacts`);
  console.log(`🌍 Network access: http://[your-ip]:${PORT}/api/contacts`);
  console.log(`📋 Ready for development and production!`);
});

export default app;
