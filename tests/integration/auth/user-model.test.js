/**
 * Тести для User моделі
 * TDD Approach: Red Phase - тести повинні падати спочатку
 *
 * @fileoverview User model integration tests
 * @module user-model.test
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';


describe('User Model', () => {
  beforeAll(async () => {
    // Синхронізуємо моделі з базою даних
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Очищуємо таблицю перед кожним тестом
    await User.destroy({ where: {}, truncate: true });
  });

  describe('User Model Creation', () => {
    it('should create a user with required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025',
        subscription: 'starter',
        verify: false, // Для тестування моделі можемо використати false
        verificationToken: 'test-token'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password); // Поки що без хешування
      expect(user.subscription).toBe(userData.subscription);
      expect(user.token).toBeNull();
      expect(user.verify).toBe(false);
      expect(user.verificationToken).toBe('test-token');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should set default subscription to "starter" when not provided', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025'
      };

      const user = await User.create(userData);

      expect(user.subscription).toBe('starter');
    });

    it('should set token to null by default', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025'
      };

      const user = await User.create(userData);

      expect(user.token).toBeNull();
    });
  });

  describe('User Model Validation', () => {
    it('should require email field', async () => {
      const userData = {
        password: 'goit2025'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'goit2025'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should validate subscription enum values', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025',
        subscription: 'invalid-subscription'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should accept valid subscription values', async () => {
      const validSubscriptions = ['starter', 'pro', 'business'];

      for (const subscription of validSubscriptions) {
        const userData = {
          email: `test-${subscription}@example.com`,
          password: 'goit2025',
          subscription
        };

        const user = await User.create(userData);
        expect(user.subscription).toBe(subscription);
      }
    });
  });

  describe('User Model Uniqueness', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025'
      };

      // Створюємо першого користувача
      await User.create(userData);

      // Намагаємося створити другого з тим же email
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should allow different emails', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        password: 'goit2025'
      });

      const user2 = await User.create({
        email: 'user2@example.com',
        password: 'goit2025'
      });

      expect(user1.email).not.toBe(user2.email);
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('User Model Database Operations', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'goit2025'
      };

      await User.create(userData);

      const foundUser = await User.findOne({ where: { email: userData.email } });

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
    });

    it('should update user token', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'goit2025'
      });

      const newToken = 'new-jwt-token';
      await user.update({ token: newToken });

      expect(user.token).toBe(newToken);
    });

    it('should remove user token', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'goit2025',
        token: 'existing-token'
      });

      await user.update({ token: null });

      expect(user.token).toBeNull();
    });
  });

  describe('User Model Relationships', () => {
    it('should have contacts relationship (to be implemented)', async () => {
      // Цей тест буде реалізований після додавання owner поля до Contact моделі
      const user = await User.create({
        email: 'test@example.com',
        password: 'goit2025'
      });

      expect(user).toBeDefined();
      // expect(user.getContacts).toBeDefined(); // Буде доступно після реалізації
    });
  });
});
