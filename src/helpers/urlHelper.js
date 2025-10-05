/**
 * Helper для створення URL з правильною обробкою слешів
 * @param {string} token - Токен верифікації
 * @param {string} baseUrl - Базовий URL з .env
 * @returns {string} Повний URL
 */
export const createVerificationUrl = (token, baseUrl = process.env.BASE_URL || 'http://localhost:3000') => {
  try {
    return new URL(`/api/auth/verify/${token}`, baseUrl).toString();
  } catch (error) {
    throw new Error(`Invalid BASE_URL configuration: ${baseUrl}`);
  }
};