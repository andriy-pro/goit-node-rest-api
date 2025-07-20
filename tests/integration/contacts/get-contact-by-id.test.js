import request from 'supertest';
import app from '../../../src/app.js';
import sequelize from '../../../src/db/connection.js';
import {
  HTTP_STATUS,
  createTestContactInDb,
  NON_EXISTENT_ID,
  INVALID_ID_FORMAT,
  createTestUser
} from '../../helpers/testConstants.js';


describe('GET /api/contacts/:id', () => {
  let testUser;
  let testContact;

  beforeEach(async () => {
    // Очищуємо та перестворюємо таблиці перед кожним тестом
    await sequelize.sync({ force: true });

    // Створюємо тестового користувача та контакт
    testUser = await createTestUser();
    testContact = await createTestContactInDb({}, testUser.id);
  });

  it('should return a contact by valid ID', async () => {
    const response = await request(app)
      .get(`/api/contacts/${testContact.id}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    expect(response.body).toHaveProperty('id', testContact.id);
    expect(response.body).toHaveProperty('name', testContact.name);
    expect(response.body).toHaveProperty('email', testContact.email);
    expect(response.body).toHaveProperty('phone', testContact.phone);
    expect(response.body).toHaveProperty('favorite', testContact.favorite);
  });

  it('should return 404 for non-existent contact ID', async () => {
    const response = await request(app)
      .get(`/api/contacts/${NON_EXISTENT_ID}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .get(`/api/contacts/${INVALID_ID_FORMAT}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for ID = 0', async () => {
    const response = await request(app)
      .get('/api/contacts/0')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for negative ID', async () => {
    const response = await request(app)
      .get('/api/contacts/-1')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for non-numeric ID', async () => {
    const response = await request(app)
      .get('/api/contacts/abc')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });
});
