/**
 * Головний серверний файл - єдина вхідна точка додатку
 * Запускає Express сервер для всіх середовищ (development, production, CI/CD)
 *
 * @fileoverview Main server entry point
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import app from './src/app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

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
