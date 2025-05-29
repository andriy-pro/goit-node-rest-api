// filepath: src/services/contactsServices.js
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

// Шлях до файлу з контактами
const contactsPath = path.join(process.cwd(), 'src', 'db', 'contacts.json');

/**
 * Читає всі контакти з файлу
 * @returns {Promise<Array>} Масив контактів
 */
export const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Файл не існує - повертаємо порожній масив
    } else if (error instanceof SyntaxError) {
      throw new Error('Файл contacts.json містить некоректний JSON');
    } else if (error.code === 'EACCES') {
      throw new Error('Недостатньо прав для читання файлу contacts.json');
    }
    throw error; // Інші помилки передаємо далі
  }
};

/**
 * Отримує контакт за ID
 * @param {string} contactId - ID контакту
 * @returns {Promise<Object|null>} Об'єкт контакту або null
 */
export const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(contact => contact.id === contactId);
  return contact || null;
};

/**
 * Видаляє контакт за ID
 * @param {string} contactId - ID контакту
 * @returns {Promise<Object|null>} Видалений контакт або null
 */
export const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);

  if (contactIndex === -1) {
    return null; // Контакт не знайдено
  }

  const [deletedContact] = contacts.splice(contactIndex, 1);

  try {
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return deletedContact;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error('Недостатньо прав для запису у файл contacts.json');
    } else if (error.code === 'ENOSPC') {
      throw new Error('Недостатньо місця на диску для збереження файлу');
    }
    throw error;
  }
};

/**
 * Додає новий контакт
 * @param {Object} body - Дані нового контакту {name, email, phone}
 * @returns {Promise<Object>} Створений контакт з ID
 */
export const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    name: body.name,
    email: body.email,
    phone: body.phone
  };

  contacts.push(newContact);

  try {
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error('Недостатньо прав для запису у файл contacts.json');
    } else if (error.code === 'ENOSPC') {
      throw new Error('Недостатньо місця на диску для збереження контакту');
    }
    throw error;
  }
};

/**
 * Оновлює контакт за ID
 * @param {string} contactId - ID контакту
 * @param {Object} body - Нові дані контакту
 * @returns {Promise<Object|null>} Оновлений контакт або null
 */
export const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);

  if (contactIndex === -1) {
    return null; // Контакт не знайдено
  }

  // Оновлюємо тільки передані поля, зберігаючи існуючі
  const updatedContact = {
    ...contacts[contactIndex],
    ...body
  };

  contacts[contactIndex] = updatedContact;

  try {
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return updatedContact;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error('Недостатньо прав для запису у файл contacts.json');
    } else if (error.code === 'ENOSPC') {
      throw new Error('Недостатньо місця на диску для збереження файлу');
    }
    throw error;
  }
};
