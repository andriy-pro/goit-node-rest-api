/**
 * Головний серверний файл - єдина вхідна точка додатку
 * Запускає Express сервер для всіх середовищ (development, production, CI/CD)
 * Ініціалізує підключення до PostgreSQL перед запуском
 *
 * @fileoverview Main server entry point with database initialization
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import app from './src/app.js';
import { initializeModels } from './src/models/index.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Запуск сервера з ініціалізацією БД
 * Забезпечує підключення до PostgreSQL перед прийомом запитів
 */
const startServer = async () => {
  try {
    // Ініціалізація моделей та підключення до БД
    await initializeModels();

    // Запускаємо сервер (крім unit тестів Jest)
    // CI/CD health check потребує запущений сервер навіть в test середовищі
    if (process.env.NODE_ENV !== 'test' || process.env.CI_HEALTH_CHECK === 'true') {
      app.listen(PORT, HOST, () => {
        console.log(`🚀 Server is running on port: ${PORT}`);
        console.log(`🌐 Local access: http://localhost:${PORT}/api/contacts`);
        console.log(`🌍 Network access: http://[your-ip]:${PORT}/api/contacts`);
        console.log(`📋 Ready for development and production!`);
      });
    }
  } catch (error) {
    console.error('Помилка запуску сервера:', error.message);
    process.exit(1);
  }
};

// Запуск сервера
startServer();
