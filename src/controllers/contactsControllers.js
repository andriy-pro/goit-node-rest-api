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
  updateContact as updateContactService
} from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";

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
const getAllContacts = async (req, res) => {
  const contacts = await listContacts();
  res.status(200).json(contacts);
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
const getOneContact = async (req, res) => {
  const { id } = req.params;
  const contact = await getContactById(id);
  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(contact);
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
const deleteContact = async (req, res) => {
  const { id } = req.params;
  const deletedContact = await removeContact(id);
  if (!deletedContact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(deletedContact);
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
const createContact = async (req, res) => {
  const newContact = await addContact(req.body);
  res.status(201).json(newContact);
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
const updateContact = async (req, res) => {
  const { id } = req.params;
  if (!req.body || Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }
  const updatedContact = await updateContactService(id, req.body);
  if (!updatedContact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(updatedContact);
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
};
