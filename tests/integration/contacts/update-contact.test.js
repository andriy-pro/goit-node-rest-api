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


describe('PUT /api/contacts/:id', () => {
  let testUser;
  let testContact;

  beforeEach(async () => {
    // Очищуємо та перестворюємо таблиці перед кожним тестом
    await sequelize.sync({ force: true });

    // Створюємо тестового користувача та контакт
    testUser = await createTestUser();
    testContact = await createTestContactInDb({}, testUser.id);
  });

  it('should update an existing contact with status 200', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      favorite: true,
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${testContact.id}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    expect(response.body).toHaveProperty('id', testContact.id);
    expect(response.body).toHaveProperty('name', updateData.name);
    expect(response.body).toHaveProperty('email', updateData.email);
    expect(response.body).toHaveProperty('phone', updateData.phone);
    expect(response.body).toHaveProperty('favorite', updateData.favorite);
  });

  it('should return 404 for non-existent contact ID', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${NON_EXISTENT_ID}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid ID format', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${INVALID_ID_FORMAT}`)
      .send(updateData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for missing required fields', async () => {
    const invalidData = {
      name: 'Updated Name',
      // missing email and phone
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${testContact.id}`)
      .send(invalidData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid email format', async () => {
    const invalidData = {
      name: 'Updated Name',
      email: 'not-an-email',
      phone: '+380991112233',
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${testContact.id}`)
      .send(invalidData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid phone format', async () => {
    const invalidData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '123', // too short
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${testContact.id}`)
      .send(invalidData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });

  it('should preserve contact structure after update', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      favorite: true,
      owner: testUser.id
    };

    const response = await request(app)
      .put(`/api/contacts/${testContact.id}`)
      .send(updateData)
      .expect(HTTP_STATUS.OK);

    // Перевіряємо, що всі поля присутні
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('phone');
    expect(response.body).toHaveProperty('favorite');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });
});
