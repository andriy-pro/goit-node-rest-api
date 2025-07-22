/**
 * Обгортка для асинхронних контролерів, яка автоматично передає помилки у next()
 * @param {Function} ctrl - асинхронний контролер
 * @returns {Function} обгорнута функція
 */
const ctrlWrapper = (ctrl) => {
  return async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export { ctrlWrapper }; 