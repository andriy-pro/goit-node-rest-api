
import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} from '../../src/services/contactsServices.js';
import { Contact, User } from '../../src/models/index.js';
import sequelize from '../../src/db/connection.js';
import { createTestUser } from '../helpers/testConstants.js';

describe('Contacts Services (Sequelize)', () => {
  let testUser;
  let testContact;

  beforeEach(async () => {
    // Clean up the tables before each test
    await Contact.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    
    // Create test user for each test
    testUser = await createTestUser();
    
    testContact = {
      name: 'Test Contact',
      email: 'test.contact@example.com',
      phone: '+380991234567',
      owner: testUser.id,
    };
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await sequelize.close();
  });

  test('should add a new contact', async () => {
    const newContact = await addContact(testContact, testUser.id);
    expect(newContact).toBeDefined();
    expect(newContact.name).toBe(testContact.name);
    expect(newContact.email).toBe(testContact.email);
    expect(newContact.phone).toBe(testContact.phone);
    expect(newContact.favorite).toBe(false);
    expect(newContact.owner).toBe(testUser.id);
  });

  it('should not allow duplicate email', async () => {
    await addContact(testContact, testUser.id);
    await expect(addContact(testContact, testUser.id)).rejects.toThrow();
  });

  test('should list all contacts with pagination', async () => {
    await addContact(testContact, testUser.id);
    const result = await listContacts(testUser.id);
    expect(result).toHaveProperty('contacts');
    expect(result).toHaveProperty('pagination');
    expect(Array.isArray(result.contacts)).toBe(true);
    expect(result.contacts.length).toBe(1);
    expect(result.contacts[0].email).toBe(testContact.email);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.pagination.totalCount).toBe(1);
  });

  test('should get a contact by id', async () => {
    const newContact = await addContact(testContact, testUser.id);
    const foundContact = await getContactById(newContact.id, testUser.id);
    expect(foundContact).toBeDefined();
    expect(foundContact.id).toBe(newContact.id);
  });

  test('should return null for non-existent id', async () => {
    const foundContact = await getContactById(999, testUser.id);
    expect(foundContact).toBeNull();
  });

  test('should update a contact', async () => {
    const newContact = await addContact(testContact, testUser.id);
    const updatedData = { name: 'Updated Name' };
    const updatedContact = await updateContact(newContact.id, updatedData, testUser.id);
    expect(updatedContact).toBeDefined();
    expect(updatedContact.name).toBe(updatedData.name);
  });

  test('should update contact status', async () => {
    const newContact = await addContact(testContact, testUser.id);
    const updatedStatus = { favorite: true };
    const updatedContact = await updateStatusContact(newContact.id, updatedStatus, testUser.id);
    expect(updatedContact).toBeDefined();
    expect(updatedContact.favorite).toBe(true);
  });

  test('should delete a contact', async () => {
    const newContact = await addContact(testContact, testUser.id);
    const deletedContact = await removeContact(newContact.id, testUser.id);
    expect(deletedContact).toBeDefined();
    const foundContact = await getContactById(newContact.id, testUser.id);
    expect(foundContact).toBeNull();
  });

  test('should handle invalid data (missing required fields)', async () => {
    const invalidContact = { name: 'Only Name' };
    await expect(addContact(invalidContact, testUser.id)).rejects.toThrow();
  });

  // Додаткові edge cases
  test('should handle empty contact list', async () => {
    const result = await listContacts(testUser.id);
    expect(result).toHaveProperty('contacts');
    expect(result).toHaveProperty('pagination');
    expect(Array.isArray(result.contacts)).toBe(true);
    expect(result.contacts.length).toBe(0);
    expect(result.pagination.totalCount).toBe(0);
  });

  test('should handle partial updates correctly', async () => {
    const newContact = await addContact(testContact, testUser.id);
    const partialUpdate = { 
      name: 'Partial Update',
      email: `partial-${Date.now()}@example.com`
    };
    const updatedContact = await updateContact(newContact.id, partialUpdate, testUser.id);
    expect(updatedContact.name).toBe(partialUpdate.name);
    expect(updatedContact.email).toBe(partialUpdate.email);
    expect(updatedContact.phone).toBe(testContact.phone); // не змінився
  });

  test('should handle favorite status toggle', async () => {
    const newContact = await addContact(testContact, testUser.id);
    
    // Встановлюємо favorite = true
    const updatedContact1 = await updateStatusContact(newContact.id, { favorite: true }, testUser.id);
    expect(updatedContact1.favorite).toBe(true);
    
    // Встановлюємо favorite = false
    const updatedContact2 = await updateStatusContact(newContact.id, { favorite: false }, testUser.id);
    expect(updatedContact2.favorite).toBe(false);
  });

  test('should return null when updating non-existent contact', async () => {
    const result = await updateContact(999, { name: 'Test' }, testUser.id);
    expect(result).toBeNull();
  });

  test('should return null when updating status of non-existent contact', async () => {
    const result = await updateStatusContact(999, { favorite: true }, testUser.id);
    expect(result).toBeNull();
  });

  test('should return null when deleting non-existent contact', async () => {
    const result = await removeContact(999, testUser.id);
    expect(result).toBeNull();
  });

  // Тести для пагінації та фільтрації
  test('should support pagination', async () => {
    // Створюємо 5 контактів
    for (let i = 0; i < 5; i++) {
      await addContact({
        ...testContact,
        email: `contact${i}@example.com`
      }, testUser.id);
    }

    // Тестуємо першу сторінку з лімітом 3
    const result1 = await listContacts(testUser.id, { page: 1, limit: 3 });
    expect(result1.contacts.length).toBe(3);
    expect(result1.pagination.page).toBe(1);
    expect(result1.pagination.limit).toBe(3);
    expect(result1.pagination.totalCount).toBe(5);
    expect(result1.pagination.totalPages).toBe(2);
    expect(result1.pagination.hasNextPage).toBe(true);
    expect(result1.pagination.hasPrevPage).toBe(false);

    // Тестуємо другу сторінку
    const result2 = await listContacts(testUser.id, { page: 2, limit: 3 });
    expect(result2.contacts.length).toBe(2);
    expect(result2.pagination.page).toBe(2);
    expect(result2.pagination.hasNextPage).toBe(false);
    expect(result2.pagination.hasPrevPage).toBe(true);
  });

  test('should support favorite filtering', async () => {
    // Створюємо контакти з різними статусами favorite
    await addContact({ ...testContact, favorite: true }, testUser.id);
    await addContact({ ...testContact, email: 'contact2@example.com', favorite: false }, testUser.id);
    await addContact({ ...testContact, email: 'contact3@example.com', favorite: true }, testUser.id);

    // Тестуємо фільтр favorite: true
    const favorites = await listContacts(testUser.id, { favorite: true });
    expect(favorites.contacts.length).toBe(2);
    favorites.contacts.forEach(contact => {
      expect(contact.favorite).toBe(true);
    });

    // Тестуємо фільтр favorite: false
    const nonFavorites = await listContacts(testUser.id, { favorite: false });
    expect(nonFavorites.contacts.length).toBe(1);
    nonFavorites.contacts.forEach(contact => {
      expect(contact.favorite).toBe(false);
    });
  });

  test('should support pagination with favorite filtering', async () => {
    // Створюємо 4 favorite контакти
    for (let i = 0; i < 4; i++) {
      await addContact({
        ...testContact,
        email: `favorite${i}@example.com`,
        favorite: true
      }, testUser.id);
    }

    // Тестуємо пагінацію з фільтром
    const result = await listContacts(testUser.id, { page: 1, limit: 2, favorite: true });
    expect(result.contacts.length).toBe(2);
    expect(result.pagination.totalCount).toBe(4);
    expect(result.pagination.totalPages).toBe(2);
    result.contacts.forEach(contact => {
      expect(contact.favorite).toBe(true);
    });
  });
});
