/**
 * Централізований error handler middleware
 * Обробляє всі помилки в додатку та повертає стандартизовані відповіді
 */
import multer from 'multer';

const errorHandler = (err, req, res, _next) => {
  // Multer errors (наприклад, перевищено розмір файлу)
  if (err instanceof multer.MulterError || err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      message: err.message || 'File upload error'
    });
  }


  // Якщо це наш HttpError
  if (err.status) {
    return res.status(err.status).json({
      message: err.message
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: err.errors.map(error => error.message).join(', ')
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Resource already exists with provided data'
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      message: err.details[0].message
    });
  }

  // Database connection errors
  if (err.name === 'SequelizeConnectionError') {
    console.error('Database connection error:', err.message);
    return res.status(503).json({
      message: 'Service temporarily unavailable'
    });
  }

  // Fallback for unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    message: 'Internal server error'
  });
};

export default errorHandler;
