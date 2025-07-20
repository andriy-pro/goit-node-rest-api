import request from 'supertest';
import app from '../../../src/app.js';
import { Contact } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import {
  HTTP_STATUS,
  createTestContactInDb,
  NON_EXISTENT_ID,
  INVALID_ID_FORMAT,
  createTestUser
} from '../../helpers/testConstants.js';


describe('DELETE /api/contacts/:id', () => {
  let testUser;
  let testContact;

  beforeEach(async () => {
    // Очищуємо та перестворюємо таблиці перед кожним тестом
    await sequelize.sync({ force: true });

    // Створюємо тестового користувача та контакт
    testUser = await createTestUser();
    testContact = await createTestContactInDb({}, testUser.id);
  });

  it('should delete an existing contact and return it with status 200', async () => {
    const response = await request(app)
      .delete(`/api/contacts/${testContact.id}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    expect(response.body).toHaveProperty('id', testContact.id);
    expect(response.body).toHaveProperty('name', testContact.name);
    expect(response.body).toHaveProperty('email', testContact.email);
    expect(response.body).toHaveProperty('phone', testContact.phone);
    expect(response.body).toHaveProperty('favorite', testContact.favorite);
  });

  it('should confirm contact is actually removed from database', async () => {
    // Спочатку видаляємо контакт
    await request(app)
      .delete(`/api/contacts/${testContact.id}`)
      .expect(HTTP_STATUS.OK);

    // Перевіряємо, що контакт дійсно видалений з бази даних
    const deletedContact = await Contact.findByPk(testContact.id);
    expect(deletedContact).toBeNull();
  });

  it('should return 404 for non-existent contact ID', async () => {
    const response = await request(app)
      .delete(`/api/contacts/${NON_EXISTENT_ID}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .delete(`/api/contacts/${INVALID_ID_FORMAT}`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).toHaveProperty('message');
  });
});
