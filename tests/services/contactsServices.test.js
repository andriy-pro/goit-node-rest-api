
import Contact from '../../src/models/Contact.js';
import sequelize from '../../src/db/connection.js';
import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
} from '../../src/services/contactsServices.js';

describe('Contacts Services (Sequelize)', () => {
  // Тестові дані
  const testContact = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '+380671234567',
    favorite: false
  };

  // Очищення таблиці перед кожним тестом
  beforeEach(async () => {
    await Contact.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new contact', async () => {
    const contact = await addContact(testContact);
    expect(contact).toBeDefined();
    expect(contact.name).toBe(testContact.name);
    expect(contact.email).toBe(testContact.email);
    expect(contact.phone).toBe(testContact.phone);
    expect(contact.favorite).toBe(false);
  });

  it('should not allow duplicate email', async () => {
    await addContact(testContact);
    await expect(addContact(testContact)).rejects.toThrow(/електронною адресою вже існує/);
  });

  it('should list all contacts', async () => {
    await addContact(testContact);
    const contacts = await listContacts();
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBe(1);
    expect(contacts[0].email).toBe(testContact.email);
  });

  it('should get contact by id', async () => {
    const contact = await addContact(testContact);
    const found = await getContactById(contact.id);
    expect(found).toBeDefined();
    expect(found.email).toBe(testContact.email);
  });

  it('should return null for non-existent contact', async () => {
    const found = await getContactById(99999);
    expect(found).toBeNull();
  });

  it('should update contact', async () => {
    const contact = await addContact(testContact);
    const updated = await updateContact(contact.id, { name: 'Updated Name', favorite: true });
    expect(updated.name).toBe('Updated Name');
    expect(updated.favorite).toBe(true);
  });

  it('should return null when updating non-existent contact', async () => {
    const updated = await updateContact(99999, { name: 'No User' });
    expect(updated).toBeNull();
  });

  it('should remove contact', async () => {
    const contact = await addContact(testContact);
    const removed = await removeContact(contact.id);
    expect(removed.id).toBe(contact.id);
    const found = await getContactById(contact.id);
    expect(found).toBeNull();
  });

  it('should return null when removing non-existent contact', async () => {
    const removed = await removeContact(99999);
    expect(removed).toBeNull();
  });

  it('should update favorite status', async () => {
    const contact = await addContact(testContact);
    const updated = await updateStatusContact(contact.id, { favorite: true });
    expect(updated.favorite).toBe(true);
  });

  it('should return null when updating favorite for non-existent contact', async () => {
    const updated = await updateStatusContact(99999, { favorite: true });
    expect(updated).toBeNull();
  });

  it('should handle invalid data (missing required fields)', async () => {
    await expect(addContact({ name: 'No Email', phone: '+380671234567' })).rejects.toThrow();
    await expect(addContact({ email: 'no-name@example.com', phone: '+380671234567' })).rejects.toThrow();
    await expect(addContact({ name: 'No Phone', email: 'no-phone@example.com' })).rejects.toThrow();
  });
});
