import request from 'supertest';
import express from 'express';
import Joi from 'joi';
import { Sequelize } from 'sequelize';
import { jest } from '@jest/globals';
import errorHandler from '../../src/middlewares/errorHandler.js';
import HttpError from '../../src/helpers/HttpError.js';
import sequelize from '../../src/db/connection.js';
import { HTTP_STATUS } from '../helpers/testConstants.js';

const app = express();
app.use(express.json());

// Route to test HttpError
app.get('/testerror/httperror', (req, res, next) => {
  next(HttpError(404, 'Not Found'));
});

// Route to test Joi validation error
app.get('/testerror/joi', (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  const { error } = schema.validate({});
  if (error) {
    next(error);
  }
});

// Route to test Sequelize validation error
app.get('/testerror/sequelize-validation', (req, res, next) => {
  const error = new Sequelize.ValidationError('Validation error');
  error.errors = [{ message: 'Name cannot be empty' }];
  next(error);
});

// Route to test Sequelize unique constraint error
app.get('/testerror/sequelize-unique', (req, res, next) => {
  const error = new Sequelize.UniqueConstraintError({
    message: 'Unique constraint error'
  });
  error.name = 'SequelizeUniqueConstraintError';
  next(error);
});

// Route to test Sequelize connection error
app.get('/testerror/sequelize-connection', (req, res, next) => {
  const error = new Error('Connection failed');
  error.name = 'SequelizeConnectionError';
  next(error);
});

// Route to test multiple validation errors
app.get('/testerror/sequelize-multiple', (req, res, next) => {
  const error = new Sequelize.ValidationError('Multiple validation errors');
  error.errors = [
    { message: 'Name cannot be empty' },
    { message: 'Email is required' }
  ];
  next(error);
});

// Route to test generic error
app.get('/testerror/generic', (req, res, next) => {
  next(new Error('Something went wrong'));
});

app.use(errorHandler);

describe('Middleware: errorHandler', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('should handle HttpError correctly', async () => {
    const response = await request(app).get('/testerror/httperror');
    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.body.message).toBe('Not Found');
  });

  it('should handle different HttpError status codes', async () => {
    // Test різних HTTP статусів
    const testApp = express();
    
    testApp.get('/test/400', (req, res, next) => {
      next(HttpError(400, 'Bad Request'));
    });
    
    testApp.get('/test/403', (req, res, next) => {
      next(HttpError(403, 'Forbidden'));
    });
    
    testApp.use(errorHandler);

    const response400 = await request(testApp).get('/test/400');
    expect(response400.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response400.body.message).toBe('Bad Request');

    const response403 = await request(testApp).get('/test/403');
    expect(response403.status).toBe(403);
    expect(response403.body.message).toBe('Forbidden');
  });

  it('should handle Joi validation errors', async () => {
    const response = await request(app).get('/testerror/joi');
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('"name" is required');
  });

  it('should handle Sequelize validation errors', async () => {
    const response = await request(app).get('/testerror/sequelize-validation');
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Name cannot be empty');
  });

  it('should handle multiple Sequelize validation errors', async () => {
    const response = await request(app).get('/testerror/sequelize-multiple');
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.message).toBe('Name cannot be empty, Email is required');
  });

  it('should handle Sequelize unique constraint errors', async () => {
    const response = await request(app).get('/testerror/sequelize-unique');
    expect(response.status).toBe(409); // Conflict
    expect(response.body.message).toBe('Resource already exists with provided data');
  });

  it('should handle Sequelize connection errors', async () => {
    // Suppress console.error for this specific test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/testerror/sequelize-connection');
    expect(response.status).toBe(503);
    expect(response.body.message).toBe('Service temporarily unavailable');
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle generic errors with a 500 status', async () => {
    // Suppress console.error for this specific test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/testerror/generic');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 