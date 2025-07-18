import HttpError from '../helpers/HttpError.js';

/**
 * Мідлвар для перевірки, чи параметр маршруту `id` є валідним цілим числом.
 * Якщо перевірка не проходить — кидає HttpError з кодом 400.
 *
 * @param {Object} req - об'єкт запиту Express
 * @param {Object} res - об'єкт відповіді Express
 * @param {Function} next - функція наступного мідлвару
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  // Перевірка, чи id — це додатнє ціле число.
  if (!/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return next(HttpError(400, `${id} is not a valid ID. Must be a positive integer.`));
  }

  next();
};

export default validateId;
