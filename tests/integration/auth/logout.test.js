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

describe('POST /api/auth/logout', () => {
  let testUser, authToken;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // Створюємо аутентифікованого користувача
    const authData = await createAuthenticatedUser();
    testUser = authData.user;
    authToken = authData.token;
  });

  describe('Successful Logout', () => {
    it('should logout user with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should remove token from user record', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Перевіряємо, що токен видалений з бази
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.token).toBeNull();
    });

    it('should work with different subscription types', async () => {
      // Оновлюємо підписку користувача
      await testUser.update({ subscription: 'pro' });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});
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
          .post('/api/auth/logout')
          .set(testCase.headers)
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
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${testCase.token}`)
          .expect(401);

        testAuthError(response, 401, 'Not authorized');
      }
    });
  });

  describe('Token Management', () => {
    it('should prevent logout after token removal', async () => {
      // Перший логаут
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Другий логаут з тим же токеном (повинен повернути 401)
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should handle logout after token removal', async () => {
      // Видаляємо токен з бази
      await testUser.update({ token: null });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });
  });
}); 