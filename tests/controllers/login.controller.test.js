/**
 * Unit тести для login контролера
 * Додаткове завдання Теми 9
 * 
 * Перевіряємо (згідно з завданням):
 * - відповідь повинна мати статус-код 200
 * - у відповіді повинен повертатися токен
 * - у відповіді повинен повертатися об'єкт user з 2 полями email и subscription з типом даних String
 */

import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/index.js';
import sequelize from '../../src/db/connection.js';
import bcrypt from 'bcrypt';

describe('Login Controller Unit Tests (Додаткове завдання Теми 9)', () => {
  let testUser;
  const testEmail = 'unittest@example.com';
  const testPassword = 'goit2025';

  beforeAll(async () => {
    // Синхронізуємо БД перед тестами
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Очищаємо таблицю користувачів
    await User.destroy({ where: {}, truncate: true });

    // Створюємо тестового користувача
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUser = await User.create({
      email: testEmail,
      password: hashedPassword,
      subscription: 'starter',
      verify: true, // Тестовий користувач верифікований
      verificationToken: null
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('✅ Обов\'язкові перевірки (за завданням Теми 9)', () => {
    it('відповідь повинна мати статус-код 200', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.statusCode).toBe(200);
    });

    it('у відповіді повинен повертатися токен', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('у відповіді повинен повертатися об\'єкт user з 2 полями email и subscription з типом даних String', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // Assert
      // Перевірка наявності об'єкта user
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toBeDefined();
      expect(typeof response.body.user).toBe('object');

      // Перевірка що об'єкт має рівно 2 поля
      const userKeys = Object.keys(response.body.user);
      expect(userKeys).toHaveLength(2);

      // Перевірка наявності полів email та subscription
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('subscription');

      // Перевірка типів даних String
      expect(typeof response.body.user.email).toBe('string');
      expect(typeof response.body.user.subscription).toBe('string');

      // Перевірка значень
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user.subscription).toBe('starter');
    });

    it('повна перевірка всіх 3 критеріїв одночасно', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      // Assert
      // 1. Статус-код 200
      expect(response.status).toBe(200);

      // 2. Токен повертається
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');

      // 3. Об'єкт user з 2 полями email та subscription типу String
      expect(response.body).toHaveProperty('user');
      expect(Object.keys(response.body.user)).toHaveLength(2);
      expect(typeof response.body.user.email).toBe('string');
      expect(typeof response.body.user.subscription).toBe('string');
    });
  });

  describe('📋 Додаткові перевірки структури відповіді', () => {
    it('should not include password in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not include id in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.user).not.toHaveProperty('id');
    });

    it('should not include avatarURL in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.user).not.toHaveProperty('avatarURL');
    });

    it('should return valid JWT token format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // JWT token має 3 частини розділені крапками
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should return valid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // Перевірка формату email
      expect(response.body.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should return valid subscription value', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // subscription має бути одним з дозволених значень
      expect(['starter', 'pro', 'business']).toContain(
        response.body.user.subscription
      );
    });
  });

  describe('🔐 Тестування різних типів підписок', () => {
    it('should work with pro subscription', async () => {
      await testUser.update({ subscription: 'pro' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.user.subscription).toBe('pro');
      expect(typeof response.body.user.subscription).toBe('string');
    });

    it('should work with business subscription', async () => {
      await testUser.update({ subscription: 'business' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.user.subscription).toBe('business');
      expect(typeof response.body.user.subscription).toBe('string');
    });
  });

  describe('❌ Обробка помилок', () => {
    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email or password is wrong');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email or password is wrong');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testPassword
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('💾 Перевірка збереження токена в БД', () => {
    it('should save token to database after successful login', async () => {
      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      // Перевірка що токен збережено в БД
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.token).toBe(response.body.token);
      expect(updatedUser.token).not.toBeNull();
    });
  });
});
