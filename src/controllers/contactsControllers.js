/**
 * Контролери для обробки HTTP запитів до API контактів
 *
 * @fileoverview Controllers for contacts REST API endpoints
 * @module contactsControllers
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact as updateContactService,
  updateStatusContact as updateStatusContactService
} from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

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
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
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
export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
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
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await removeContact(id);
    if (!deletedContact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(deletedContact);
  } catch (error) {
    next(error);
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
export const createContact = async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);
    if (!newContact) {
      throw HttpError(400, "Validation error");
    }
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
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
export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = await updateContactService(id, req.body);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

/**
 * Оновити статус favorite контакту
 * PATCH /api/contacts/:id/favorite
 *
 * @async
 * @function updateContactStatus
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID контакту для оновлення статусу
 * @param {Object} req.body - Дані для оновлення статусу {favorite: boolean}
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з оновленим контактом або 404
 */
export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = await updateStatusContactService(id, req.body);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
