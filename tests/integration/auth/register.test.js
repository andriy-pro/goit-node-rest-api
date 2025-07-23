import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS } from '../../helpers/testConstants.js';
import { 
  testSuccessfulAuthResponse, 
  testAuthError
} from '../../helpers/authTestHelpers.js';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
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

      testSuccessfulAuthResponse(response, userData.email);
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
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
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
    // Тестуємо тільки найважливіші випадки валідації
    it('should return 400 for missing required fields', async () => {
      const testCases = [
        { data: { password: 'testpassword' }, error: 'email' },
        { data: { email: 'test@example.com' }, error: 'password' },
        { data: { email: 'invalid-email', password: 'testpassword' }, error: 'valid email' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testCase.data)
          .expect(HTTP_STATUS.BAD_REQUEST);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(new RegExp(testCase.error, 'i'));
      }
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

      testAuthError(response, 409, 'Email in use');
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

      testSuccessfulAuthResponse(response, userData.email);
    });
  });
}); 