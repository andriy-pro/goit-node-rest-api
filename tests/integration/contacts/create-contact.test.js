import request from 'supertest';
import app from '../../../src/app.js';
import { Contact } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { 
  HTTP_STATUS, 
  TEST_CONTACTS,
  createTestContact,
  createUniqueEmail 
} from '../../helpers/testConstants.js';

describe('POST /api/contacts', () => {
  beforeEach(async () => {
    // Очищуємо таблицю перед кожним тестом для ізоляції
    await Contact.destroy({ where: {}, truncate: true });
  });

  it('should create a new contact with status 201', async () => {
    const uniqueContactData = createTestContact();
    
    const response = await request(app)
      .post('/api/contacts')
      .send(uniqueContactData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(uniqueContactData.name);
    expect(response.body.email).toBe(uniqueContactData.email);
    expect(response.body.phone).toBe(uniqueContactData.phone);
    expect(response.body.favorite).toBe(false); // default value
  });

  it('should set default favorite to false when not provided', async () => {
    const contactData = {
      name: 'Test User',
      email: createUniqueEmail(),
      phone: '+380991234567'
    };

    const response = await request(app)
      .post('/api/contacts')
      .send(contactData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.favorite).toBe(false);
  });

  it('should accept favorite field when provided', async () => {
    const contactData = createTestContact({ favorite: true });

    const response = await request(app)
      .post('/api/contacts')
      .send(contactData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.favorite).toBe(true);
  });

  describe('Validation errors', () => {
    it('should return 400 for missing email field', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.MISSING_EMAIL)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 for missing phone field', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.MISSING_PHONE)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/phone/i);
    });

    it('should return 400 for missing name field', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.MISSING_NAME)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/name/i);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.INVALID_EMAIL)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('valid email');
    });

    it('should return 400 for invalid phone format (no +)', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.INVALID_PHONE_NO_PLUS)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for phone number too short', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send(TEST_CONTACTS.INVALID_PHONE_TOO_SHORT)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Database constraints', () => {
    it('should handle duplicate email gracefully', async () => {
      const contactData = createTestContact();
      
      // Створюємо перший контакт
      await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(HTTP_STATUS.CREATED);

      // Намагаємося створити контакт з тим же email
      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(409); // Conflict для дублікату

      expect(response.body).toHaveProperty('message');
    });
  });
}); 