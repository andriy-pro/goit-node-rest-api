/**
 * Оптимізовані тести для захищених маршрутів контактів
 * Використовує допоміжні функції для зменшення дублювання коду
 *
 * @fileoverview Optimized protected contact routes tests
 * @module protected-contacts-optimized.test
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import request from 'supertest';
import app from '../../../src/app.js';
import sequelize from '../../../src/db/connection.js';
import { HTTP_STATUS } from '../../helpers/testConstants.js';
import { 
  createAuthenticatedUser,
  testAuthError
} from '../../helpers/authTestHelpers.js';
import {
  createTestContact,
  createTestContacts,
  createContactsForTwoUsers,
  expectContactOwnership,
  expectContactStructure,
  createUpdateData,
  createContactData,
  expectContactDeleted,
  expectContactExists,
  createContact
} from '../../helpers/contactTestHelpers.js';

describe('Protected Contact Routes (Optimized)', () => {
  let user1, user2, token1, token2;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    // Створюємо двох користувачів для тестування owner-based доступу
    const authData1 = await createAuthenticatedUser({
      email: 'user1@example.com',
      password: 'password123'
    });
    const authData2 = await createAuthenticatedUser({
      email: 'user2@example.com',
      password: 'password123'
    });
    
    user1 = authData1.user;
    user2 = authData2.user;
    token1 = authData1.token;
    token2 = authData2.token;
  });

  describe('GET /api/contacts - Protected List Contacts', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should return only user\'s own contacts', async () => {
      // Створюємо контакти для обох користувачів
      const { user1Contact, user2Contact } = await createContactsForTwoUsers(user1, user2);

      // Користувач 1 повинен бачити тільки свої контакти
      const response1 = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response1.body).toHaveProperty('contacts');
      expect(response1.body).toHaveProperty('pagination');
      expect(response1.body.contacts).toHaveLength(1);
      expect(response1.body.contacts[0].id).toBe(user1Contact.id);
      expect(response1.body.contacts[0].name).toBe('User 1 Contact');

      // Користувач 2 повинен бачити тільки свої контакти
      const response2 = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response2.body).toHaveProperty('contacts');
      expect(response2.body).toHaveProperty('pagination');
      expect(response2.body.contacts).toHaveLength(1);
      expect(response2.body.contacts[0].id).toBe(user2Contact.id);
      expect(response2.body.contacts[0].name).toBe('User 2 Contact');
    });

    it('should return empty array for user with no contacts', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.contacts).toHaveLength(0);
      expect(response.body.pagination.totalCount).toBe(0);
    });
  });

  describe('GET /api/contacts/:id - Protected Get Contact', () => {
    let userContact, otherUserContact;

    beforeEach(async () => {
      const contacts = await createContactsForTwoUsers(user1, user2);
      userContact = contacts.user1Contact;
      otherUserContact = contacts.user2Contact;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/contacts/${userContact.id}`)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should return contact if user owns it', async () => {
      const response = await request(app)
        .get(`/api/contacts/${userContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expectContactStructure(response.body, {
        id: userContact.id,
        name: 'User 1 Contact',
        email: 'user1@example.com'
      });
      expectContactOwnership(response.body, user1);
    });

    it('should return 404 if user does not own the contact', async () => {
      const response = await request(app)
        .get(`/api/contacts/${otherUserContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.message).toBe('Not found');
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .get('/api/contacts/999999')
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.message).toBe('Not found');
    });
  });

  describe('POST /api/contacts - Protected Create Contact', () => {
    it('should return 401 without authentication', async () => {
      const contactData = createContactData();

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should create contact with authentication', async () => {
      const contactData = createContactData({
        name: 'New Test Contact',
        email: 'newtest@example.com'
      });

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token1}`)
        .send(contactData)
        .expect(201);

      expectContactStructure(response.body, {
        name: 'New Test Contact',
        email: 'newtest@example.com',
        favorite: false
      });
      expectContactOwnership(response.body, user1);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: 'Invalid Contact' }; // відсутній email та phone

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token1}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/contacts/:id - Protected Update Contact', () => {
    let userContact, otherUserContact;

    beforeEach(async () => {
      const contacts = await createContactsForTwoUsers(user1, user2);
      userContact = contacts.user1Contact;
      otherUserContact = contacts.user2Contact;
    });

    it('should return 401 without authentication', async () => {
      const updateData = createUpdateData();

      const response = await request(app)
        .put(`/api/contacts/${userContact.id}`)
        .send(updateData)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should update contact if user owns it', async () => {
      const updateData = createUpdateData({
        name: 'Updated Test Contact'
      });

      const response = await request(app)
        .put(`/api/contacts/${userContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send(updateData)
        .expect(200);

      expectContactStructure(response.body, {
        name: 'Updated Test Contact',
        email: 'updated@example.com'
      });
      expectContactOwnership(response.body, user1);
    });

    it('should return 404 if user does not own the contact', async () => {
      const updateData = createUpdateData();

      const response = await request(app)
        .put(`/api/contacts/${otherUserContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Not found');
    });
  });

  describe('DELETE /api/contacts/:id - Protected Delete Contact', () => {
    let userContact, otherUserContact;

    beforeEach(async () => {
      const contacts = await createContactsForTwoUsers(user1, user2);
      userContact = contacts.user1Contact;
      otherUserContact = contacts.user2Contact;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${userContact.id}`)
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should delete contact if user owns it', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${userContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expectContactStructure(response.body, {
        id: userContact.id,
        name: 'User 1 Contact'
      });

      await expectContactDeleted(userContact.id);
    });

    it('should return 404 if user does not own the contact', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${otherUserContact.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      expect(response.body.message).toBe('Not found');
      await expectContactExists(otherUserContact.id);
    });
  });

  describe('PATCH /api/contacts/:id/favorite - Protected Update Favorite', () => {
    let userContact, otherUserContact;

    beforeEach(async () => {
      const contacts = await createContactsForTwoUsers(user1, user2);
      userContact = contacts.user1Contact;
      otherUserContact = contacts.user2Contact;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch(`/api/contacts/${userContact.id}/favorite`)
        .send({ favorite: true })
        .expect(401);

      testAuthError(response, 401, 'Not authorized');
    });

    it('should update favorite status if user owns the contact', async () => {
      const response = await request(app)
        .patch(`/api/contacts/${userContact.id}/favorite`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ favorite: true })
        .expect(200);

      expectContactStructure(response.body, {
        favorite: true
      });
      expectContactOwnership(response.body, user1);
    });

    it('should return 404 if user does not own the contact', async () => {
      const response = await request(app)
        .patch(`/api/contacts/${otherUserContact.id}/favorite`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ favorite: true })
        .expect(404);

      expect(response.body.message).toBe('Not found');
    });
  });

  describe('GET /api/contacts - Pagination and Filtering', () => {
    beforeEach(async () => {
      // Створюємо кілька контактів для тестування пагінації
      await createContact(user1, {
        name: 'Contact 1',
        email: 'contact1@example.com',
        phone: '+380991111111',
        favorite: true
      });
      await createContact(user1, {
        name: 'Contact 2',
        email: 'contact2@example.com',
        phone: '+380992222222',
        favorite: false
      });
      await createContact(user1, {
        name: 'Contact 3',
        email: 'contact3@example.com',
        phone: '+380993333333',
        favorite: true
      });
      await createContact(user1, {
        name: 'Contact 4',
        email: 'contact4@example.com',
        phone: '+380994444444',
        favorite: false
      });
    });

    it('should support pagination with default parameters', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.totalCount).toBe(4);
      expect(response.body.pagination.totalPages).toBe(1);
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.hasPrevPage).toBe(false);
    });

    it('should support custom pagination parameters', async () => {
      const response = await request(app)
        .get('/api/contacts?page=1&limit=2')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.contacts).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalCount).toBe(4);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(true);
      expect(response.body.pagination.hasPrevPage).toBe(false);
    });

    it('should support second page pagination', async () => {
      const response = await request(app)
        .get('/api/contacts?page=2&limit=2')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.contacts).toHaveLength(2);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.hasNextPage).toBe(false);
      expect(response.body.pagination.hasPrevPage).toBe(true);
    });

    it('should filter by favorite=true', async () => {
      const response = await request(app)
        .get('/api/contacts?favorite=true')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.contacts).toHaveLength(2);
      response.body.contacts.forEach(contact => {
        expect(contact.favorite).toBe(true);
      });
      expect(response.body.pagination.totalCount).toBe(2);
    });

    it('should filter by favorite=false', async () => {
      const response = await request(app)
        .get('/api/contacts?favorite=false')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.contacts).toHaveLength(2);
      response.body.contacts.forEach(contact => {
        expect(contact.favorite).toBe(false);
      });
      expect(response.body.pagination.totalCount).toBe(2);
    });

    it('should combine pagination and filtering', async () => {
      const response = await request(app)
        .get('/api/contacts?page=1&limit=1&favorite=true')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.contacts).toHaveLength(1);
      expect(response.body.contacts[0].favorite).toBe(true);
      expect(response.body.pagination.totalCount).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/contacts?page=0')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.message).toBe('Page must be a positive number');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/contacts?limit=101')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.message).toBe('Limit must be between 1 and 100');
    });

    it('should return 400 for invalid favorite parameter', async () => {
      const response = await request(app)
        .get('/api/contacts?favorite=invalid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body.message).toBe("Favorite must be 'true' or 'false'");
    });
  });
}); 