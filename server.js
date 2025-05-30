/**
 * Точка входу для запуску Express сервера
 * Імпортує та запускає застосунок на заданому порту
 *
 * @fileoverview Server entry point
 * @author Andriy Nechyporenko
 * @version 1.0.0
 */

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Слухаємо на всіх інтерфейсах

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}/api/contacts`);
  console.log(`🌍 Network access: http://[your-ip]:${PORT}/api/contacts`);
  console.log(`📋 Ready for development and production!`);
});
