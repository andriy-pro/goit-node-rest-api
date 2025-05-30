/**
 * Головний серверний файл - єдина вхідна точка додатку
 * Запускає Express сервер для всіх середовищ (development, production, CI/CD)
 *
 * @fileoverview Main server entry point
 * @author GoIT Student
 * @version 1.0.0
 */

import app from './src/app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Запускаємо сервер (крім тестів)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log(`🌐 Local access: http://localhost:${PORT}/api/contacts`);
    console.log(`🌍 Network access: http://[your-ip]:${PORT}/api/contacts`);
    console.log(`📋 Ready for development and production!`);
  });
}
