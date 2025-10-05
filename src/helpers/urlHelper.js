/**
 * Отримує базовий URL для додатку
 * Пріоритет: BASE_URL з .env > динамічне формування з HOST/PORT
 * @returns {string} Базовий URL
 */
const getBaseUrl = () => {
  // Якщо BASE_URL явно встановлений, використовуємо його
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Інакше формуємо динамічно з HOST та PORT
  const host = process.env.HOST === '0.0.0.0' ? 'localhost' : (process.env.HOST || 'localhost');
  const port = process.env.PORT || 3000;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  return `${protocol}://${host}:${port}`;
};

/**
 * Helper для створення URL з правильною обробкою слешів
 * @param {string} token - Токен верифікації
 * @param {string} customBaseUrl - Опціональний кастомний базовий URL
 * @returns {string} Повний URL
 */
export const createVerificationUrl = (token, customBaseUrl = null) => {
  try {
    const baseUrl = customBaseUrl || getBaseUrl();
    return new URL(`/api/auth/verify/${token}`, baseUrl).toString();
  } catch (error) {
    throw new Error(`Invalid BASE_URL configuration: ${customBaseUrl || getBaseUrl()}`);
  }
};