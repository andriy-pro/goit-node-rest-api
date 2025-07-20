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
 * Отримати список контактів користувача з підтримкою пагінації та фільтрації
 * GET /api/contacts?page=1&limit=20&favorite=true
 *
 * @async
 * @function getAllContacts
 * @param {Object} req - Express request object
 * @param {Object} req.user - Користувач з middleware аутентифікації
 * @param {Object} req.query - Query параметри для пагінації та фільтрації
 * @param {string} [req.query.page=1] - Номер сторінки
 * @param {string} [req.query.limit=20] - Кількість контактів на сторінці
 * @param {string} [req.query.favorite] - Фільтр по статусу favorite (true/false)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з контактами та метаданими пагінації
 */
export const getAllContacts = async (req, res, next) => {
  try {
    const { page, limit, favorite } = req.query;
    
    // Парсимо та валідуємо параметри
    const options = {};
    
    if (page) {
      const pageNum = parseInt(page);
      if (pageNum < 1) {
        throw HttpError(400, "Page must be a positive number");
      }
      options.page = pageNum;
    }
    
    if (limit) {
      const limitNum = parseInt(limit);
      if (limitNum < 1 || limitNum > 100) {
        throw HttpError(400, "Limit must be between 1 and 100");
      }
      options.limit = limitNum;
    }
    
    if (favorite !== undefined) {
      if (favorite === 'true') {
        options.favorite = true;
      } else if (favorite === 'false') {
        options.favorite = false;
      } else {
        throw HttpError(400, "Favorite must be 'true' or 'false'");
      }
    }
    
    const result = await listContacts(req.user.id, options);
    res.status(200).json(result);
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
 * @param {Object} req.user - Користувач з middleware аутентифікації
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з контактом або 404
 */
export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id, req.user.id);
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
 * @param {Object} req.user - Користувач з middleware аутентифікації
 * @param {Object} res - Express response object
 * @returns {Promise<void>} HTTP відповідь з видаленим контактом або 404
 */
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await removeContact(id, req.user.id);
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
    const newContact = await addContact(req.body, req.user.id);
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
    const updatedContact = await updateContactService(id, req.body, req.user.id);
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
    const updatedContact = await updateStatusContactService(id, req.body, req.user.id);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
