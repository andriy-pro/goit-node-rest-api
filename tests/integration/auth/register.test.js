import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS } from '../../helpers/testConstants.js';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    // Очищуємо та перестворюємо таблиці перед кожним тестом
    await sequelize.sync({ force: true });
  });

  describe('Successful Registration', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'examplepassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('subscription', 'starter');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('token');
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'examplepassword'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      // Перевіряємо, що пароль захешований в базі
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeDefined();
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should set default subscription to starter', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'examplepassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.user.subscription).toBe('starter');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing email', async () => {
      const userData = {
        password: 'examplepassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 for missing password', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/password/i);
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'examplepassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/valid email/i);
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/password/i);
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Conflict Errors', () => {
    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'examplepassword'
      };

      // Реєструємо першого користувача
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      // Намагаємося реєструвати другого з тим же email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email in use');
    });
  });

  describe('Response Structure', () => {
    it('should return correct response structure', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'examplepassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('subscription');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('id');
    });
  });
}); 