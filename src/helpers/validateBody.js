/**
 * Middleware для валідації body запитів з використанням Joi схем
 * Інтегрується з HttpError для стандартизованої обробки помилок
 *
 * @fileoverview Validation middleware for request body
 * @module validateBody
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import HttpError from "./HttpError.js";

/**
 * Створює middleware для валідації body запиту
 * Використовує Joi схему для перевірки даних
 *
 * @function validateBody
 * @param {Object} schema - Joi схема для валідації
 * @returns {Function} Express middleware функція
 *
 * @example
 * import validateBody from './helpers/validateBody.js';
 * import { contactCreateSchema } from './schemas/contactsSchemas.js';
 *
 * router.post('/', validateBody(contactCreateSchema), createContact);
 */
const validateBody = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(HttpError(400, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;
