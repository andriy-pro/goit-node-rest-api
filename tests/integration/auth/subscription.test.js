/**
 * Тести для оновлення підписки користувача
 * Перевіряє функціональність PATCH /api/auth/subscription
 *
 * @fileoverview User subscription update tests
 * @module subscription.test
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import request from 'supertest';
import app from '../../../src/app.js';
import sequelize from '../../../src/db/connection.js';
import { createAuthenticatedUser, testAuthError } from '../../helpers/authTestHelpers.js';

describe('User Subscription Update', () => {
  let user, token;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // Створюємо користувача для тестування
    const authData = await createAuthenticatedUser({
      email: 'test@example.com',
      password: 'password123'
    });
    
    user = authData.user;
    token = authData.token;
  });

  describe('PATCH /api/auth/subscription', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .send({ subscription: 'pro' })
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should update subscription to pro', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'pro' })
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('subscription', 'pro');
    });

    it('should update subscription to business', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'business' })
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('subscription', 'business');
    });

    it('should update subscription back to starter', async () => {
      // Спочатку змінюємо на pro
      await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'pro' })
        .expect(200);

      // Потім повертаємо на starter
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'starter' })
        .expect(200);

      expect(response.body).toHaveProperty('subscription', 'starter');
    });

    it('should return 400 for invalid subscription value', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'invalid' })
        .expect(400);

      expect(response.body.message).toContain('Subscription must be one of: starter, pro, business');
    });

    it('should return 400 for missing subscription field', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Subscription is a required field');
    });

    it('should return 400 for empty subscription value', async () => {
      const response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: '' })
        .expect(400);

      expect(response.body.message).toContain('Subscription must be one of: starter, pro, business');
    });

    it('should persist subscription change in database', async () => {
      // Оновлюємо підписку
      await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'business' })
        .expect(200);

      // Перевіряємо, що зміни збереглися через current endpoint
      const currentResponse = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(currentResponse.body.subscription).toBe('business');
    });

    it('should handle multiple subscription updates', async () => {
      // starter -> pro
      let response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'pro' })
        .expect(200);
      expect(response.body.subscription).toBe('pro');

      // pro -> business
      response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'business' })
        .expect(200);
      expect(response.body.subscription).toBe('business');

      // business -> starter
      response = await request(app)
        .patch('/api/auth/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscription: 'starter' })
        .expect(200);
      expect(response.body.subscription).toBe('starter');
    });
  });
}); 