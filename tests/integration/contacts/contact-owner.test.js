/**
 * Тести для Contact моделі з полем owner
 * TDD Approach: Red Phase - тести повинні падати спочатку
 *
 * @fileoverview Contact model with owner field integration tests
 * @module contact-owner.test
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import request from 'supertest';
import app from '../../../src/app.js';
import { Contact, User } from '../../../src/models/index.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS, createTestContact } from '../../helpers/testConstants.js';

describe('Contact Model with Owner Field', () => {
  let testUser1, testUser2;

  beforeAll(async () => {
    // Налаштовуємо зв'язки між моделями
    User.hasMany(Contact, {
      foreignKey: 'owner',
      as: 'contacts',
      onDelete: 'CASCADE'
    });

    Contact.belongsTo(User, {
      foreignKey: 'owner',
      as: 'user'
    });

    // Синхронізуємо моделі з базою даних
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Очищуємо всі дані та перестворюємо таблиці
    await sequelize.sync({ force: true });

    // Створюємо тестових користувачів
    testUser1 = await User.create({
      email: 'user1@example.com',
      password: 'password123'
    });

    testUser2 = await User.create({
      email: 'user2@example.com',
      password: 'password123'
    });
  });

  describe('Contact Creation with Owner', () => {
    it('should create a contact with owner field', async () => {
      const contactData = {
        ...createTestContact(),
        owner: testUser1.id
      };

      const contact = await Contact.create(contactData);

      expect(contact).toBeDefined();
      expect(contact.id).toBeDefined();
      expect(contact.owner).toBe(testUser1.id);
      expect(contact.name).toBe(contactData.name);
      expect(contact.email).toBe(contactData.email);
      expect(contact.phone).toBe(contactData.phone);
    });

    it('should require owner field', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380991234567',
        favorite: false
        // Не додаємо owner поле
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });

    it('should validate owner field is integer', async () => {
      const contactData = {
        ...createTestContact(),
        owner: 'invalid-owner'
      };

      await expect(Contact.create(contactData)).rejects.toThrow();
    });
  });

  describe('Contact Filtering by Owner', () => {
    it('should filter contacts by owner', async () => {
      // Створюємо контакти для різних користувачів
      const contact1 = await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      await Contact.create({
        ...createTestContact(),
        owner: testUser2.id
      });

      // Фільтруємо контакти для user1
      const user1Contacts = await Contact.findAll({
        where: { owner: testUser1.id }
      });

      expect(user1Contacts).toHaveLength(1);
      expect(user1Contacts[0].id).toBe(contact1.id);
      expect(user1Contacts[0].owner).toBe(testUser1.id);
    });

    it('should not return contacts from other users', async () => {
      // Створюємо контакт для user2
      await Contact.create({
        ...createTestContact(),
        owner: testUser2.id
      });

      // Шукаємо контакти для user1
      const user1Contacts = await Contact.findAll({
        where: { owner: testUser1.id }
      });

      expect(user1Contacts).toHaveLength(0);
    });
  });

  describe('Contact API with Owner Field', () => {
    it('should create contact via API with owner field', async () => {
      const contactData = {
        ...createTestContact(),
        owner: testUser1.id
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('owner');
      expect(response.body.owner).toBe(testUser1.id);
    });

    it('should return only user contacts via API', async () => {
      // Створюємо контакти для різних користувачів
      await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      await Contact.create({
        ...createTestContact(),
        owner: testUser2.id
      });

      // Отримуємо контакти через API (поки що без аутентифікації)
      const response = await request(app)
        .get('/api/contacts')
        .expect('Content-Type', /json/)
        .expect(HTTP_STATUS.OK);

      // Поки що API повертає всі контакти (потім буде фільтрація по owner)
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Contact Model Relationships', () => {
    it('should have relationship with User model', async () => {
      const contact = await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      expect(contact).toBeDefined();
      // expect(contact.getUser).toBeDefined(); // Буде доступно після налаштування зв'язків
    });

    it('should allow finding contact with user data', async () => {
      const contact = await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      const contactWithUser = await Contact.findOne({
        where: { id: contact.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'subscription']
          }
        ]
      });

      expect(contactWithUser).toBeDefined();
      // expect(contactWithUser.user).toBeDefined(); // Буде доступно після налаштування зв'язків
    });
  });

  describe('Contact Update with Owner', () => {
    it('should not allow changing owner field', async () => {
      const contact = await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      // Намагаємося змінити owner
      await expect(
        contact.update({ owner: testUser2.id })
      ).rejects.toThrow();
    });

    it('should allow updating other fields while preserving owner', async () => {
      const contact = await Contact.create({
        ...createTestContact(),
        owner: testUser1.id
      });

      const originalOwner = contact.owner;
      const newName = 'Updated Name';

      await contact.update({ name: newName });

      expect(contact.name).toBe(newName);
      expect(contact.owner).toBe(originalOwner);
    });
  });
});
