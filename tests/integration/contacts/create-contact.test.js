import request from 'supertest';
import app from '../../../src/app.js';
import sequelize from '../../../src/db/connection.js';
import {
  HTTP_STATUS,
  TEST_CONTACTS,
  createTestContact,
  createUniqueEmail,
  createTestUser
} from '../../helpers/testConstants.js';

describe('POST /api/contacts', () => {
  let testUser;

  beforeEach(async () => {
    // Очищуємо та перестворюємо таблиці перед кожним тестом
    await sequelize.sync({ force: true });

    // Створюємо тестового користувача для кожного тесту
    testUser = await createTestUser();
  });

  it('should create a new contact with status 201', async () => {
    const uniqueContactData = createTestContact({}, testUser.id);

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
      phone: '+380991234567',
      owner: testUser.id
    };

    const response = await request(app)
      .post('/api/contacts')
      .send(contactData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.favorite).toBe(false);
  });

  it('should accept favorite field when provided', async () => {
    const contactData = createTestContact({ favorite: true }, testUser.id);

    const response = await request(app)
      .post('/api/contacts')
      .send(contactData)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS.CREATED);

    expect(response.body.favorite).toBe(true);
  });

  describe('Validation errors', () => {
    it('should return 400 for missing email field', async () => {
      const invalidData = {
        ...TEST_CONTACTS.MISSING_EMAIL,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 for missing phone field', async () => {
      const invalidData = {
        ...TEST_CONTACTS.MISSING_PHONE,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/phone/i);
    });

    it('should return 400 for missing name field', async () => {
      const invalidData = {
        ...TEST_CONTACTS.MISSING_NAME,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/name/i);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...TEST_CONTACTS.INVALID_EMAIL,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('valid email');
    });

    it('should return 400 for invalid phone format (no +)', async () => {
      const invalidData = {
        ...TEST_CONTACTS.INVALID_PHONE_NO_PLUS,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for phone number too short', async () => {
      const invalidData = {
        ...TEST_CONTACTS.INVALID_PHONE_TOO_SHORT,
        owner: testUser.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
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
      const contactData = createTestContact({}, testUser.id);

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
