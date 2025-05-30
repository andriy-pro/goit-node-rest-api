/**
 * Сервіс для роботи з контактами
 * Надає CRUD операції для управління контактами у JSON файлі
 *
 * @fileoverview Contacts service with full CRUD functionality
 * @module contactsServices
 * @author GoIT Student
 * @version 1.0.0 - Simple and clean implementation
 * @license GPL-3.0
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

// Константи для шляхів та конфігурації
const CONTACTS_PATH = path.join(process.cwd(), 'src', 'db', 'contacts.json');
const JSON_ENCODING = 'utf-8';
const JSON_INDENT_SPACES = 2;

// Типи помилок файлової системи
const FS_ERROR_CODES = {
  FILE_NOT_FOUND: 'ENOENT',
  ACCESS_DENIED: 'EACCES',
  NO_SPACE: 'ENOSPC'
};

// Повідомлення про помилки
const ERROR_MESSAGES = {
  INVALID_JSON: 'Файл contacts.json містить некоректний JSON',
  READ_ACCESS_DENIED: 'Недостатньо прав для читання файлу contacts.json',
  WRITE_ACCESS_DENIED: 'Недостатньо прав для запису у файл contacts.json',
  NO_DISK_SPACE: 'Недостатньо місця на диску для збереження файлу',
  CONTACT_SAVE_FAILED: 'Недостатньо місця на диску для збереження контакту'
};

/**
 * Допоміжна функція для безпечного збереження контактів у файл
 * @private
 * @param {Array} contacts - Масив контактів для збереження
 * @throws {Error} - Помилки запису файлу з деталізованими повідомленнями
 */
const saveContactsToFile = async (contacts) => {
  try {
    await writeFile(
      CONTACTS_PATH,
      JSON.stringify(contacts, null, JSON_INDENT_SPACES),
      JSON_ENCODING
    );
  } catch (error) {
    if (error.code === FS_ERROR_CODES.ACCESS_DENIED) {
      throw new Error(ERROR_MESSAGES.WRITE_ACCESS_DENIED);
    } else if (error.code === FS_ERROR_CODES.NO_SPACE) {
      throw new Error(ERROR_MESSAGES.NO_DISK_SPACE);
    }
    throw error;
  }
};

/**
 * Читає всі контакти з файлу
 * Використовує безпечну обробку помилок для різних сценаріїв
 *
 * @async
 * @function listContacts
 * @returns {Promise<Array<Object>>} Масив об'єктів контактів
 * @throws {Error} - Помилки читання файлу або парсингу JSON
 *
 * @example
 * const contacts = await listContacts();
 * console.log(contacts); // [{id: '1', name: 'John', email: 'john@example.com', phone: '+123456789'}]
 */
export const listContacts = async () => {
  try {
    const data = await readFile(CONTACTS_PATH, JSON_ENCODING);
    return JSON.parse(data);
  } catch (error) {
    if (error.code === FS_ERROR_CODES.FILE_NOT_FOUND) {
      return []; // Файл не існує - повертаємо порожній масив
    } else if (error instanceof SyntaxError) {
      throw new Error(ERROR_MESSAGES.INVALID_JSON);
    } else if (error.code === FS_ERROR_CODES.ACCESS_DENIED) {
      throw new Error(ERROR_MESSAGES.READ_ACCESS_DENIED);
    }
    throw error; // Інші помилки передаємо далі
  }
};

/**
 * Отримує контакт за унікальним ідентифікатором
 * Виконує безпечний пошук контакту без модифікації даних
 *
 * @async
 * @function getContactById
 * @param {string} contactId - Унікальний ідентифікатор контакту
 * @returns {Promise<Object|null>} Об'єкт контакту або null, якщо не знайдено
 * @throws {Error} - Помилки читання файлу
 *
 * @example
 * const contact = await getContactById('123');
 * if (contact) {
 *   console.log(contact.name); // 'John Doe'
 * }
 */
export const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(contact => contact.id === contactId);
  return contact || null;
};

/**
 * Видаляє контакт з колекції за ідентифікатором
 * Виконує атомарну операцію видалення з безпечним збереженням
 *
 * @async
 * @function removeContact
 * @param {string} contactId - Унікальний ідентифікатор контакту для видалення
 * @returns {Promise<Object|null>} Видалений об'єкт контакту або null, якщо не знайдено
 * @throws {Error} - Помилки читання/запису файлу
 *
 * @example
 * const deletedContact = await removeContact('123');
 * if (deletedContact) {
 *   console.log(`Видалено: ${deletedContact.name}`);
 * }
 */
export const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);

  if (contactIndex === -1) {
    return null; // Контакт не знайдено
  }

  const [deletedContact] = contacts.splice(contactIndex, 1);
  await saveContactsToFile(contacts);

  return deletedContact;
};

/**
 * Створює та додає новий контакт до колекції
 * Автоматично генерує унікальний ідентифікатор для нового контакту
 *
 * @async
 * @function addContact
 * @param {Object} body - Дані нового контакту
 * @param {string} body.name - Ім'я контакту (обов'язкове)
 * @param {string} body.email - Email адреса контакту (обов'язкове)
 * @param {string} body.phone - Номер телефону контакту (обов'язкове)
 * @returns {Promise<Object>} Створений контакт з згенерованим ID
 * @throws {Error} - Помилки валідації або запису файлу
 *
 * @example
 * const newContact = await addContact({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890'
 * });
 * console.log(newContact.id); // згенерований nanoid
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
  await saveContactsToFile(contacts);

  return newContact;
};

/**
 * Оновлює існуючий контакт частковими або повними даними
 * Зберігає існуючі поля, які не передані для оновлення
 *
 * @async
 * @function updateContact
 * @param {string} contactId - Унікальний ідентифікатор контакту для оновлення
 * @param {Object} body - Часткові дані для оновлення контакту
 * @param {string} [body.name] - Нове ім'я контакту (опціонально)
 * @param {string} [body.email] - Нова email адреса (опціонально)
 * @param {string} [body.phone] - Новий номер телефону (опціонально)
 * @returns {Promise<Object|null>} Оновлений контакт або null, якщо не знайдено
 * @throws {Error} - Помилки валідації або запису файлу
 *
 * @example
 * const updatedContact = await updateContact('123', { name: 'Jane Doe' });
 * if (updatedContact) {
 *   console.log(updatedContact.name); // 'Jane Doe'
 *   console.log(updatedContact.email); // залишається попередній email
 * }
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
  await saveContactsToFile(contacts);

  return updatedContact;
};
