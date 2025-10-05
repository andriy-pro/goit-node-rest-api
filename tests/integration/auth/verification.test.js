import { jest } from '@jest/globals';

// Мокування Nodemailer ПЕРЕД будь-якими іншими імпортами
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
  }
}));

// Тепер імпортуємо решту модулів
const request = (await import('supertest')).default;
const { default: app } = await import('../../../src/app.js');
const { default: sequelize } = await import('../../../src/db/connection.js');
const { createUnverifiedTestUser, createTestUser } = await import('../../helpers/authTestHelpers.js');
const { User } = await import('../../../src/models/index.js');

describe('Email Verification Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Очищуємо таблицю перед кожним тестом
    await User.destroy({ where: {}, truncate: true });
  });

  describe('GET /api/auth/verify/:verificationToken', () => {
    test('should verify email with valid token', async () => {
      const user = await createUnverifiedTestUser();
      
      const response = await request(app)
        .get(`/api/auth/verify/${user.verificationToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Verification successful'
      });

      // Перевіряємо що користувач верифікований в БД
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.verify).toBe(true);
      expect(updatedUser.verificationToken).toBeNull();
    });

    test('should return 404 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify/invalid-token')
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });

    test('should return 404 for already used token', async () => {
      const user = await createUnverifiedTestUser();
      
      // Перша верифікація
      await request(app)
        .get(`/api/auth/verify/${user.verificationToken}`)
        .expect(200);

      // Повторна верифікація з тим же токеном
      const response = await request(app)
        .get(`/api/auth/verify/${user.verificationToken}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });

    test('should return 404 for null token', async () => {
      const response = await request(app)
        .get('/api/auth/verify/null')
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('POST /api/auth/verify', () => {
    test('should resend verification email for unverified user', async () => {
      const user = await createUnverifiedTestUser();
      
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: user.email })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Verification email sent'
      });
    });

    test('should generate new token if missing and resend email', async () => {
      // Створюємо користувача без токена (edge case)
      const user = await createTestUser({ 
        verify: false, 
        verificationToken: null 
      });
      
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: user.email })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Verification email sent'
      });

      // Перевіряємо що новий токен згенерований
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.verificationToken).not.toBeNull();
      expect(updatedUser.verificationToken).toMatch(/^[A-Za-z0-9_-]+$/); // nanoid format
    });

    test('should return 400 for already verified user', async () => {
      const user = await createTestUser({ verify: true });
      
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: user.email })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Verification has already been passed'
      });
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect(400);

      expect(response.body.message).toMatch(/email/i);
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toMatch(/email/i);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('Login with email verification', () => {
    test('should block login for unverified user', async () => {
      const user = await createUnverifiedTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: user.email, 
          password: 'testpassword' 
        })
        .expect(401);

      expect(response.body).toEqual({
        message: 'Email not verified'
      });
    });

    test('should allow login after email verification', async () => {
      const user = await createUnverifiedTestUser();
      
      // Верифікуємо email
      await request(app)
        .get(`/api/auth/verify/${user.verificationToken}`)
        .expect(200);

      // Тепер логін має працювати
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: user.email, 
          password: 'testpassword' 
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);
    });
  });

  describe('Edge cases and security', () => {
    test('should handle user with empty string token', async () => {
      const user = await createTestUser({ 
        verify: false, 
        verificationToken: '' 
      });
      
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: user.email })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Verification email sent'
      });

      // Перевіряємо що новий токен згенерований
      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.verificationToken).not.toBe('');
      expect(updatedUser.verificationToken).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    test('should not expose verificationToken in any response', async () => {
      const user = await createUnverifiedTestUser();
      
      // Перевіряємо resend response
      const resendResponse = await request(app)
        .post('/api/auth/verify')
        .send({ email: user.email })
        .expect(200);

      expect(resendResponse.body).not.toHaveProperty('verificationToken');
      expect(JSON.stringify(resendResponse.body)).not.toContain(user.verificationToken);

      // Перевіряємо verify response
      const verifyResponse = await request(app)
        .get(`/api/auth/verify/${user.verificationToken}`)
        .expect(200);

      expect(verifyResponse.body).not.toHaveProperty('verificationToken');
      expect(JSON.stringify(verifyResponse.body)).not.toContain(user.verificationToken);
    });
  });
});