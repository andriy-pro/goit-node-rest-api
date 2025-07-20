
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

  test('should list all contacts', async () => {
    await addContact(testContact, testUser.id);
    const contacts = await listContacts(testUser.id);
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBe(1);
    expect(contacts[0].email).toBe(testContact.email);
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
    const contacts = await listContacts(testUser.id);
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBe(0);
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
});
