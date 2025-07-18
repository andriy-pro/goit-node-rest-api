/**
 * Тести для HttpError helper
 * Покриває створення помилок з HTTP статусами
 *
 * @fileoverview HttpError helper tests
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import HttpError from '../../src/helpers/HttpError.js';

describe('HttpError Helper', () => {
  it('should create error with status and message', () => {
    const error = HttpError(404, 'Not found');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('should handle undefined message with default', () => {
    const error = HttpError(404, undefined);
    
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
  });

  it('should create multiple independent errors', () => {
    const error1 = HttpError(404, 'Not found');
    const error2 = HttpError(500, 'Server error');
    
    expect(error1.status).toBe(404);
    expect(error1.message).toBe('Not found');
    expect(error2.status).toBe(500);
    expect(error2.message).toBe('Server error');
  });
}); 