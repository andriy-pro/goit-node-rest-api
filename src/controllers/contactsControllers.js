/**
 * Контролери для обробки HTTP запитів до API контактів
 *
 * @fileoverview Controllers for contacts REST API endpoints
 * @module contactsControllers
 * @author Andriy Nechyporenko
 * @version 1.0.0
 */

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact as updateContactService
} from "../services/contactsServices.js";

/**
 * Отримати список всіх контактів
 * GET /api/contacts
 *
 * @async
 * @function getAllContacts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з списком контактів
 */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при отриманні контактів",
      error: error.message
    });
  }
};

/**
 * Отримати один контакт за ID
 * GET /api/contacts/:id
 *
 * @async
 * @function getOneContact
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID контакту
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з контактом або 404
 */
export const getOneContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);

    if (!contact) {
      return res.status(404).json({
        message: `Контакт з ID ${id} не знайдено`
      });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при отриманні контакту",
      error: error.message
    });
  }
};

/**
 * Видалити контакт за ID
 * DELETE /api/contacts/:id
 *
 * @async
 * @function deleteContact
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID контакту для видалення
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з видаленим контактом або 404
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await removeContact(id);

    if (!deletedContact) {
      return res.status(404).json({
        message: `Контакт з ID ${id} не знайдено`
      });
    }

    res.status(200).json(deletedContact);
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при видаленні контакту",
      error: error.message
    });
  }
};

/**
 * Створити новий контакт
 * POST /api/contacts
 *
 * @async
 * @function createContact
 * @param {Object} req - Express request object
 * @param {Object} req.body - Дані нового контакту {name, email, phone}
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з створеним контактом
 */
export const createContact = async (req, res) => {
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при створенні контакту",
      error: error.message
    });
  }
};

/**
 * Оновити існуючий контакт
 * PUT /api/contacts/:id
 *
 * @async
 * @function updateContact
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID контакту для оновлення
 * @param {Object} req.body - Нові дані контакту
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з оновленим контактом або 404
 */
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await updateContactService(id, req.body);

    if (!updatedContact) {
      return res.status(404).json({
        message: `Контакт з ID ${id} не знайдено`
      });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера при оновленні контакту",
      error: error.message
    });
  }
};
