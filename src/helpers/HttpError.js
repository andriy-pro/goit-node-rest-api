/**
 * Створює HTTP помилки з відповідними статус кодами
 * Забезпечує стандартизовані повідомлення про помилки
 *
 * @fileoverview HTTP error creator for consistent error handling
 * @module HttpError
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

// Стандартні повідомлення для HTTP статус кодів
const messageList = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Internal Server Error"
};

/**
 * Створює HTTP помилку з заданим статусом та повідомленням
 *
 * @function HttpError
 * @param {number} status - HTTP статус код
 * @param {string} [message] - Користувацьке повідомлення про помилку
 * @returns {Error} Error об'єкт з властивістю status
 *
 * @example
 * const error = HttpError(404, "Контакт не знайдено");
 * throw error; // Буде оброблено глобальним error handler
 */
const HttpError = (status, message = messageList[status]) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export default HttpError;
