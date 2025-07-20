/**
 * Допоміжні функції для тестів контактів
 * Зменшує дублювання коду та покращує читабельність тестів
 *
 * @fileoverview Contact test helper functions
 * @module contactTestHelpers
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { Contact } from '../../src/models/index.js';

/**
 * Створює тестовий контакт для користувача
 * @param {Object} user - Користувач (власник контакту)
 * @param {Object} contactData - Додаткові дані контакту
 * @returns {Promise<Object>} Створений контакт
 */
export const createTestContact = async (user, contactData = {}) => {
  const defaultContact = {
    name: 'Test Contact',
    email: 'test@example.com',
    phone: '+380991234567',
    favorite: false,
    owner: user.id,
    ...contactData
  };

  return await Contact.create(defaultContact);
};

/**
 * Створює кілька тестових контактів для користувача
 * @param {Object} user - Користувач (власник контактів)
 * @param {number} count - Кількість контактів для створення
 * @param {Object} baseData - Базові дані для всіх контактів
 * @returns {Promise<Array>} Масив створених контактів
 */
export const createTestContacts = async (user, count = 3, baseData = {}) => {
  const contacts = [];
  
  for (let i = 0; i < count; i++) {
    const contactData = {
      name: `Contact ${i + 1}`,
      email: `contact${i + 1}@example.com`,
      phone: `+38099123456${i}`,
      ...baseData
    };
    
    const contact = await createTestContact(user, contactData);
    contacts.push(contact);
  }
  
  return contacts;
};

/**
 * Створює контакти для двох користувачів для тестування owner-based доступу
 * @param {Object} user1 - Перший користувач
 * @param {Object} user2 - Другий користувач
 * @returns {Promise<Object>} Об'єкт з контактами обох користувачів
 */
export const createContactsForTwoUsers = async (user1, user2) => {
  const user1Contact = await createTestContact(user1, {
    name: 'User 1 Contact',
    email: 'user1@example.com',
    phone: '+380991234567'
  });
  
  const user2Contact = await createTestContact(user2, {
    name: 'User 2 Contact',
    email: 'user2@example.com',
    phone: '+380991234568'
  });
  
  return {
    user1Contact,
    user2Contact
  };
};

/**
 * Перевіряє, що контакт належить правильному користувачу
 * @param {Object} contact - Контакт для перевірки
 * @param {Object} user - Користувач, якому повинен належати контакт
 */
export const expectContactOwnership = (contact, user) => {
  expect(contact.owner).toBe(user.id);
};

/**
 * Перевіряє, що контакт має правильну структуру
 * @param {Object} contact - Контакт для перевірки
 * @param {Object} expectedData - Очікувані дані
 */
export const expectContactStructure = (contact, expectedData = {}) => {
  expect(contact).toHaveProperty('id');
  expect(contact).toHaveProperty('name');
  expect(contact).toHaveProperty('email');
  expect(contact).toHaveProperty('phone');
  expect(contact).toHaveProperty('favorite');
  expect(contact).toHaveProperty('owner');
  expect(contact).toHaveProperty('createdAt');
  expect(contact).toHaveProperty('updatedAt');
  
  // Перевіряємо очікувані дані
  Object.keys(expectedData).forEach(key => {
    expect(contact[key]).toBe(expectedData[key]);
  });
};

/**
 * Створює дані для оновлення контакту
 * @param {Object} updateData - Додаткові дані для оновлення
 * @returns {Object} Дані для оновлення
 */
export const createUpdateData = (updateData = {}) => ({
  name: 'Updated Contact',
  email: 'updated@example.com',
  phone: '+380991234567',
  ...updateData
});

/**
 * Створює дані для створення контакту
 * @param {Object} contactData - Додаткові дані контакту
 * @returns {Object} Дані для створення контакту
 */
export const createContactData = (contactData = {}) => ({
  name: 'New Contact',
  email: 'new@example.com',
  phone: '+380991234567',
  favorite: false,
  ...contactData
});

/**
 * Перевіряє, що контакт був видалений з бази даних
 * @param {number} contactId - ID контакту
 */
export const expectContactDeleted = async (contactId) => {
  const deletedContact = await Contact.findByPk(contactId);
  expect(deletedContact).toBeNull();
};

/**
 * Перевіряє, що контакт залишився в базі даних
 * @param {number} contactId - ID контакту
 */
export const expectContactExists = async (contactId) => {
  const contact = await Contact.findByPk(contactId);
  expect(contact).toBeDefined();
};

/**
 * Очищує всі контакти з бази даних
 */
export const clearContacts = async () => {
  await Contact.destroy({ where: {}, truncate: true });
}; 