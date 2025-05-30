/**
 * Інтеграційні тести для REST API ендпоінтів
 *
 * Ці тести перевіряють повний flow від HTTP запиту до відповіді,
 * включаючи роутинг, контролери, сервіси, валідацію та middleware.
 *
 * @author GoIT Student
 */

import request from 'supertest';
import { nanoid } from 'nanoid';
import app from '../../src/app.js';

describe('🧪 Integration Tests: REST API Endpoints', () => {

  // Test data setup
  let testContactId;
  const validContactData = {
    name: 'Тестовий Контакт',
    email: 'test@example.com',
    phone: '+380501234567'
  };

  // Cleanup після кожного тесту для ізоляції
  afterEach(async () => {
    // Видаляємо тестовий контакт якщо він був створений
    if (testContactId) {
      try {
        await request(app).delete(`/api/contacts/${testContactId}`);
      } catch (error) {
        // Ігноруємо помилку якщо контакт вже видалений
      }
      testContactId = null;
    }
  });

  describe('GET /api/contacts', () => {

    test('✅ має повертати масив контактів зі статусом 200', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Перевіряємо структуру першого контакту якщо масив не порожній
      if (response.body.length > 0) {
        const contact = response.body[0];
        expect(contact).toHaveProperty('id');
        expect(contact).toHaveProperty('name');
        expect(contact).toHaveProperty('email');
        expect(contact).toHaveProperty('phone');
      }
    });

    test('✅ має мати правильні CORS headers', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(200);

      // Перевіряємо що CORS middleware працює
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

  });

  describe('GET /api/contacts/:id', () => {

    beforeEach(async () => {
      // Створюємо тестовий контакт через API
      const response = await request(app)
        .post('/api/contacts')
        .send(validContactData);
      testContactId = response.body.id;
    });

    test('✅ має повертати контакт за існуючим ID зі статусом 200', async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testContactId);
      expect(response.body).toHaveProperty('name', validContactData.name);
      expect(response.body).toHaveProperty('email', validContactData.email);
      expect(response.body).toHaveProperty('phone', validContactData.phone);
    });

    test('❌ має повертати 404 для неіснуючого ID', async () => {
      const nonExistentId = nanoid();

      const response = await request(app)
        .get(`/api/contacts/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('не знайдено'); // Ukrainian: "not found"
    });

  });

  describe('POST /api/contacts', () => {

    test('✅ має створювати новий контакт зі статусом 201', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(validContactData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Зберігаємо ID для cleanup
      testContactId = response.body.id;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', validContactData.name);
      expect(response.body).toHaveProperty('email', validContactData.email);
      expect(response.body).toHaveProperty('phone', validContactData.phone);
      expect(typeof response.body.id).toBe('string');
    });

    test('❌ має повертати 400 для відсутніх обов\'язкових полів', async () => {
      const invalidData = {
        name: 'Тільки ім\'я'
        // email та phone відсутні
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('обов\'язкови'); // Ukrainian: "required"
    });

    test('❌ має повертати 400 для невалідного email', async () => {
      const invalidData = {
        ...validContactData,
        email: 'невалідний-email'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('❌ має повертати 400 для невалідного телефону (не E.164)', async () => {
      const invalidData = {
        ...validContactData,
        phone: '0501234567' // без +
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('❌ має повертати 400 для занадто короткого телефону', async () => {
      const invalidData = {
        ...validContactData,
        phone: '+123' // занадто короткий
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('PUT /api/contacts/:id', () => {

    beforeEach(async () => {
      // Створюємо тестовий контакт через API
      const response = await request(app)
        .post('/api/contacts')
        .send(validContactData);
      testContactId = response.body.id;
    });

    test('✅ має оновлювати існуючий контакт зі статусом 200', async () => {
      const updateData = {
        name: 'Оновлене ім\'я',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testContactId);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('email', updateData.email);
      expect(response.body).toHaveProperty('phone', validContactData.phone); // незмінний
    });

    test('❌ має повертати 404 для неіснуючого ID', async () => {
      const nonExistentId = nanoid();
      const updateData = { name: 'Нове ім\'я' };

      const response = await request(app)
        .put(`/api/contacts/${nonExistentId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('не знайдено'); // Ukrainian: "not found"
    });

    test('❌ має повертати 400 для порожнього body', async () => {
      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('хоча б одне поле'); // Ukrainian: "at least one field"
    });

    test('❌ має повертати 400 для невалідних даних', async () => {
      const invalidData = {
        email: 'невалідний-email'
      };

      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('DELETE /api/contacts/:id', () => {

    beforeEach(async () => {
      // Створюємо тестовий контакт через API
      const response = await request(app)
        .post('/api/contacts')
        .send(validContactData);
      testContactId = response.body.id;
    });

    test('✅ має видаляти існуючий контакт зі статусом 200', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${testContactId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testContactId);
      expect(response.body).toHaveProperty('name', validContactData.name);
      expect(response.body).toHaveProperty('email', validContactData.email);
      expect(response.body).toHaveProperty('phone', validContactData.phone);

      // Очищаємо testContactId щоб afterEach не намагався видалити знову
      testContactId = null;
    });

    test('❌ має повертати 404 для неіснуючого ID', async () => {
      const nonExistentId = nanoid();

      const response = await request(app)
        .delete(`/api/contacts/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('не знайдено'); // Ukrainian: "not found"
    });

  });

  describe('🛡️ Middleware та Error Handling', () => {

    test('✅ має обробляти невалідний JSON', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Content-Type', 'application/json')
        .send('{"невалідний": json}') // невалідний JSON
        .expect(400);

      // Express автоматично обробляє syntax errors в JSON
      expect(response.status).toBe(400);
    });

    test('✅ має повертати 404 для неіснуючих маршрутів', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.status).toBe(404);
    });

  });

});
