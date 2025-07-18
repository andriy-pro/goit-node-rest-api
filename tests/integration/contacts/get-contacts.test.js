import request from 'supertest';
import app from '../../../src/app.js';
import { Contact } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS, createTestContact } from '../../helpers/testConstants.js';

// Допоміжна функція для створення контакту в БД
const addTestContact = async (contactData = {}) => {
  const testContact = createTestContact(contactData);
  return await Contact.create(testContact);
};

describe('GET /api/contacts', () => {
  beforeEach(async () => {
    // Очищуємо таблицю перед кожним тестом для ізоляції
    await Contact.destroy({ where: {}, truncate: true });
  });

  it('should return an empty array when no contacts exist', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return all contacts when they exist', async () => {
    // Створюємо кілька тестових контактів
    await addTestContact({ name: 'Contact 1' });
    await addTestContact({ name: 'Contact 2' });
    await addTestContact({ name: 'Contact 3' });

    const response = await request(app)
      .get('/api/contacts')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
    
    // Перевіряємо структуру повернених контактів
    response.body.forEach(contact => {
      expect(contact).toHaveProperty('id');
      expect(contact).toHaveProperty('name');
      expect(contact).toHaveProperty('email');
      expect(contact).toHaveProperty('phone');
      expect(contact).toHaveProperty('favorite');
    });
  });

  it('should return contacts with correct data types', async () => {
    const testContact = await addTestContact();

    const response = await request(app)
      .get('/api/contacts')
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.OK);

    const contact = response.body[0];
    expect(typeof contact.id).toBe('number');
    expect(typeof contact.name).toBe('string');
    expect(typeof contact.email).toBe('string');
    expect(typeof contact.phone).toBe('string');
    expect(typeof contact.favorite).toBe('boolean');
  });
}); 