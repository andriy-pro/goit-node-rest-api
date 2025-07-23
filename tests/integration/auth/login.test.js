import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS } from '../../helpers/testConstants.js';
import { 
  createTestUser, 
  testSuccessfulAuthResponse, 
  testAuthError,
  testJWTToken
} from '../../helpers/authTestHelpers.js';

describe('POST /api/auth/login', () => {
  let testUser;
  const testPassword = 'examplepassword';
  const testEmail = 'test@example.com';

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // Створюємо тестового користувача для логіну
    testUser = await createTestUser({
      email: testEmail,
      password: testPassword
    });
  });

  describe('Successful Login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: testEmail,
        password: testPassword
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('token');
      testSuccessfulAuthResponse(response, testEmail);
      testJWTToken(response.body.token);
    });

    it('should save token to user record', async () => {
      const loginData = {
        email: testEmail,
        password: testPassword
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.OK);

      // Перевіряємо, що токен збережений в базі
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.token).toBeDefined();
      expect(updatedUser.token).not.toBeNull();
    });

    it('should work with different subscription types', async () => {
      // Оновлюємо підписку користувача
      await testUser.update({ subscription: 'pro' });

      const loginData = {
        email: testEmail,
        password: testPassword
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.OK);

      expect(response.body.user.subscription).toBe('pro');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing required fields', async () => {
      const testCases = [
        { data: { password: testPassword }, error: 'email' },
        { data: { email: testEmail }, error: 'password' },
        { data: { email: 'invalid-email', password: testPassword }, error: 'valid email' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase.data)
          .expect(HTTP_STATUS.BAD_REQUEST);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(new RegExp(testCase.error, 'i'));
      }
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for invalid credentials', async () => {
      const testCases = [
        { 
          data: { email: 'nonexistent@example.com', password: testPassword },
          message: 'Email or password is wrong'
        },
        { 
          data: { email: testEmail, password: 'wrongpassword' },
          message: 'Email or password is wrong'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase.data)
          .expect(401);

        testAuthError(response, 401, testCase.message);
      }
    });
  });

  describe('Response Structure', () => {
    it('should return correct response structure', async () => {
      const loginData = {
        email: testEmail,
        password: testPassword
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('subscription');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('id');
    });
  });
}); 