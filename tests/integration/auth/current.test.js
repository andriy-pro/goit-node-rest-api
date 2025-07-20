import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS } from '../../helpers/testConstants.js';
import { 
  createAuthenticatedUser,
  createAuthToken,
  testAuthError
} from '../../helpers/authTestHelpers.js';

describe('GET /api/auth/current', () => {
  let testUser, authToken;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // Створюємо аутентифікованого користувача
    const authData = await createAuthenticatedUser();
    testUser = authData.user;
    authToken = authData.token;
  });

  describe('Successful Current User', () => {
    it('should return current user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('subscription', 'starter');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('id');
    });

    it('should work with different subscription types', async () => {
      const subscriptions = ['pro', 'business'];
      
      for (const subscription of subscriptions) {
        // Оновлюємо підписку користувача
        await testUser.update({ subscription });

        const response = await request(app)
          .get('/api/auth/current')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body.subscription).toBe(subscription);
      }
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 for missing or invalid authorization', async () => {
      const testCases = [
        { 
          headers: {}, 
          description: 'missing Authorization header' 
        },
        { 
          headers: { Authorization: 'InvalidToken' }, 
          description: 'invalid token format' 
        },
        { 
          headers: { Authorization: `Bearer ${createAuthToken(testUser, { expiresIn: '1ms' })}` }, 
          description: 'expired token',
          delay: 10
        }
      ];

      for (const testCase of testCases) {
        if (testCase.delay) {
          await new Promise(resolve => setTimeout(resolve, testCase.delay));
        }

        const response = await request(app)
          .get('/api/auth/current')
          .set(testCase.headers)
          .expect('Content-Type', /json/)
          .expect(401);

        testAuthError(response, 401, 'Not authorized');
      }
    });

    it('should return 401 for non-existent user or token mismatch', async () => {
      const testCases = [
        {
          token: createAuthToken({ id: 999999, email: 'fake@example.com' }),
          description: 'non-existent user'
        },
        {
          token: createAuthToken(testUser, { additionalData: { different: true } }),
          description: 'token mismatch'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/auth/current')
          .set('Authorization', `Bearer ${testCase.token}`)
          .expect(401);

        testAuthError(response, 401, 'Not authorized');
      }
    });

    it('should return 401 for null token in database', async () => {
      // Видаляємо токен з бази
      await testUser.update({ token: null });

      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });
  });

  describe('Response Structure', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('subscription');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('id');
      expect(typeof response.body.email).toBe('string');
      expect(typeof response.body.subscription).toBe('string');
    });

    it('should return only required fields', async () => {
      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HTTP_STATUS.OK);

      const responseKeys = Object.keys(response.body);
      expect(responseKeys).toHaveLength(2);
      expect(responseKeys).toContain('email');
      expect(responseKeys).toContain('subscription');
    });
  });

  describe('Token Management', () => {
    it('should work after user logout and relogin', async () => {
      // Спочатку логаутуємося
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Перевіряємо, що токен видалений
      const userAfterLogout = await User.findByPk(testUser.id);
      expect(userAfterLogout.token).toBeNull();

      // Генеруємо новий токен
      const newToken = createAuthToken(testUser);

      // Зберігаємо новий токен
      await User.update({ token: newToken }, { where: { id: testUser.id } });

      // Перевіряємо, що токен збережений
      const userAfterUpdate = await User.findByPk(testUser.id);
      expect(userAfterUpdate.token).toBe(newToken);

      // Тестуємо current endpoint з новим токеном
      const response = await request(app)
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.email).toBe(testUser.email);
    });
  });
}); 