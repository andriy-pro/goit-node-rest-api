
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
    const newContact = await addContact(testContact);
    expect(newContact).toBeDefined();
    expect(newContact.name).toBe(testContact.name);
    expect(newContact.email).toBe(testContact.email);
    expect(newContact.phone).toBe(testContact.phone);
    expect(newContact.favorite).toBe(false);
    expect(newContact.owner).toBe(testUser.id);
  });

  it('should not allow duplicate email', async () => {
    await addContact(testContact);
    await expect(addContact(testContact)).rejects.toThrow();
  });

  test('should list all contacts', async () => {
    await addContact(testContact);
    const contacts = await listContacts();
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBe(1);
    expect(contacts[0].email).toBe(testContact.email);
  });

  test('should get a contact by id', async () => {
    const newContact = await addContact(testContact);
    const foundContact = await getContactById(newContact.id);
    expect(foundContact).toBeDefined();
    expect(foundContact.id).toBe(newContact.id);
  });

  test('should return null for non-existent id', async () => {
    const foundContact = await getContactById(999);
    expect(foundContact).toBeNull();
  });

  test('should update a contact', async () => {
    const newContact = await addContact(testContact);
    const updatedData = { name: 'Updated Name' };
    const updatedContact = await updateContact(newContact.id, updatedData);
    expect(updatedContact).toBeDefined();
    expect(updatedContact.name).toBe(updatedData.name);
  });

  test('should update contact status', async () => {
    const newContact = await addContact(testContact);
    const updatedStatus = { favorite: true };
    const updatedContact = await updateStatusContact(newContact.id, updatedStatus);
    expect(updatedContact).toBeDefined();
    expect(updatedContact.favorite).toBe(true);
  });

  test('should delete a contact', async () => {
    const newContact = await addContact(testContact);
    const deletedContact = await removeContact(newContact.id);
    expect(deletedContact).toBeDefined();
    const foundContact = await getContactById(newContact.id);
    expect(foundContact).toBeNull();
  });

  test('should handle invalid data (missing required fields)', async () => {
    const invalidContact = { name: 'Only Name' };
    await expect(addContact(invalidContact)).rejects.toThrow();
  });

  // Додаткові edge cases
  test('should handle empty contact list', async () => {
    const contacts = await listContacts();
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBe(0);
  });

  test('should handle partial updates correctly', async () => {
    const newContact = await addContact(testContact);
    const partialUpdate = { 
      name: 'Partial Update',
      email: `partial-${Date.now()}@example.com`
    };
    const updatedContact = await updateContact(newContact.id, partialUpdate);
    expect(updatedContact.name).toBe(partialUpdate.name);
    expect(updatedContact.email).toBe(partialUpdate.email);
    expect(updatedContact.phone).toBe(testContact.phone); // не змінився
  });

  test('should handle favorite status toggle', async () => {
    const newContact = await addContact(testContact);
    
    // Встановлюємо favorite = true
    const updatedContact1 = await updateStatusContact(newContact.id, { favorite: true });
    expect(updatedContact1.favorite).toBe(true);
    
    // Встановлюємо favorite = false
    const updatedContact2 = await updateStatusContact(newContact.id, { favorite: false });
    expect(updatedContact2.favorite).toBe(false);
  });

  test('should return null when updating non-existent contact', async () => {
    const result = await updateContact(999, { name: 'Test' });
    expect(result).toBeNull();
  });

  test('should return null when updating status of non-existent contact', async () => {
    const result = await updateStatusContact(999, { favorite: true });
    expect(result).toBeNull();
  });

  test('should return null when deleting non-existent contact', async () => {
    const result = await removeContact(999);
    expect(result).toBeNull();
  });
});
