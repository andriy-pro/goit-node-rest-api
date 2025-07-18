/**
 * Сервіс для роботи з контактами
 * Надає CRUD операції для управління контактами у PostgreSQL через Sequelize
 *
 * @fileoverview Contacts service with full CRUD functionality using Sequelize
 * @module contactsServices
 * @author Andriy Nechyporenko
 * @version 2.0.0 - PostgreSQL + Sequelize implementation
 * @license GPL-3.0
 */

import { Contact } from '../models/index.js';


/**
 * Читає всі контакти з бази даних PostgreSQL
 * Використовує Sequelize для отримання даних
 *
 * @async
 * @function listContacts
 * @returns {Promise<Array<Object>>} Масив об'єктів контактів
 * @throws {Error} - Помилки роботи з базою даних
 *
 * @example
 * const contacts = await listContacts();
 * console.log(contacts); // [{id: 1, name: 'John', email: 'john@example.com', phone: '+123456789', favorite: false}]
 */
export const listContacts = async () => {
  const contacts = await Contact.findAll({
    order: [['createdAt', 'DESC']],
  });
  return contacts;
};

/**
 * Отримує контакт за унікальним ідентифікатором
 * Використовує Sequelize для пошуку в базі даних
 *
 * @async
 * @function getContactById
 * @param {string|number} contactId - Унікальний ідентифікатор контакту
 * @returns {Promise<Object|null>} Об'єкт контакту або null, якщо не знайдено
 * @throws {Error} - Помилки роботи з базою даних
 *
 * @example
 * const contact = await getContactById(123);
 * if (contact) {
 *   console.log(contact.name); // 'John Doe'
 * }
 */
export const getContactById = async (contactId) => {
  const contact = await Contact.findByPk(contactId);
  return contact;
};

/**
 * Видаляє контакт з бази даних за ідентифікатором
 * Використовує Sequelize для атомарного видалення
 *
 * @async
 * @function removeContact
 * @param {string|number} contactId - Унікальний ідентифікатор контакту для видалення
 * @returns {Promise<Object|null>} Видалений об'єкт контакту або null, якщо не знайдено
 * @throws {Error} - Помилки роботи з базою даних
 *
 * @example
 * const deletedContact = await removeContact(123);
 * if (deletedContact) {
 *   console.log(`Видалено: ${deletedContact.name}`);
 * }
 */
export const removeContact = async (contactId) => {
  const contact = await Contact.findByPk(contactId);
  if (contact) {
    await contact.destroy();
  }
  return contact;
};

/**
 * Створює та додає новий контакт до бази даних
 * Використовує Sequelize для створення запису в PostgreSQL
 *
 * @async
 * @function addContact
 * @param {Object} body - Дані нового контакту
 * @param {string} body.name - Ім'я контакту (обов'язкове)
 * @param {string} body.email - Email адреса контакту (обов'язкове)
 * @param {string} body.phone - Номер телефону контакту (обов'язкове)
 * @param {boolean} [body.favorite=false] - Статус "вибраний" (опціонально)
 * @returns {Promise<Object>} Створений контакт з автогенерованим ID
 * @throws {Error} - Помилки валідації або роботи з базою даних
 *
 * @example
 * const newContact = await addContact({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890',
 *   favorite: false
 * });
 * console.log(newContact.id); // автоінкремент ID з PostgreSQL
 */
export const addContact = async (body) => {
  const newContact = await Contact.create(body);
  return newContact;
};

/**
 * Оновлює існуючий контакт частковими або повними даними
 * Використовує Sequelize для оновлення в базі даних
 *
 * @async
 * @function updateContact
 * @param {string|number} contactId - Унікальний ідентифікатор контакту для оновлення
 * @param {Object} body - Часткові дані для оновлення контакту
 * @param {string} [body.name] - Нове ім'я контакту (опціонально)
 * @param {string} [body.email] - Нова email адреса (опціонально)
 * @param {string} [body.phone] - Новий номер телефону (опціонально)
 * @param {boolean} [body.favorite] - Новий статус favorite (опціонально)
 * @returns {Promise<Object|null>} Оновлений контакт або null, якщо не знайдено
 * @throws {Error} - Помилки валідації або роботи з базою даних
 *
 * @example
 * const updatedContact = await updateContact(123, { name: 'Jane Doe' });
 * if (updatedContact) {
 *   console.log(updatedContact.name); // 'Jane Doe'
 *   console.log(updatedContact.email); // залишається попередній email
 * }
 */
export const updateContact = async (contactId, body) => {
  const contact = await Contact.findByPk(contactId);
  if (contact) {
    const updatedContact = await contact.update(body);
    return updatedContact;
  }
  return null;
};

/**
 * Оновлює статус favorite контакту
 * Спеціальна функція для PATCH /api/contacts/:id/favorite endpoint
 *
 * @async
 * @function updateStatusContact
 * @param {string|number} contactId - Унікальний ідентифікатор контакту
 * @param {Object} body - Дані для оновлення статусу
 * @param {boolean} body.favorite - Новий статус favorite
 * @returns {Promise<Object|null>} Оновлений контакт або null, якщо не знайдено
 * @throws {Error} - Помилки валідації або роботи з базою даних
 *
 * @example
 * const updatedContact = await updateStatusContact(123, { favorite: true });
 * if (updatedContact) {
 *   console.log(updatedContact.favorite); // true
 * }
 */
export const updateStatusContact = async (contactId, body) => {
  const contact = await Contact.findByPk(contactId);
  if (contact) {
    const updatedContact = await contact.update({
      favorite: body.favorite,
    });
    return updatedContact;
  }
  return null;
};
