/**
 * Роутер для обробки API запитів до контактів
 * Налаштовує маршрути з валідацією та контролерами
 *
 * @fileoverview Express router for contacts API endpoints
 * @module contactsRouter
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateContactStatus,
} from "../controllers/contactsControllers.js";
import validateId from "../middlewares/validateId.js";
import validateBody from "../helpers/validateBody.js";
import {
  contactCreateSchema,
  contactUpdateSchema,
  contactFavoriteSchema
} from "../schemas/contactsSchemas.js";

const contactsRouter = express.Router();

// GET /api/contacts - отримати всі контакти
contactsRouter.get("/", getAllContacts);

// GET /api/contacts/:id - отримати контакт за ID
contactsRouter.get("/:id", validateId, getOneContact);

// DELETE /api/contacts/:id - видалити контакт за ID
contactsRouter.delete("/:id", validateId, deleteContact);

// POST /api/contacts - створити новий контакт (з валідацією)
contactsRouter.post("/", validateBody(contactCreateSchema), createContact);

// PUT /api/contacts/:id - оновити контакт за ID (з валідацією)
contactsRouter.put("/:id", validateId, validateBody(contactUpdateSchema), updateContact);

// PATCH /api/contacts/:id/favorite - оновити статус favorite контакту (з валідацією)
contactsRouter.patch("/:id/favorite", validateId, validateBody(contactFavoriteSchema), updateContactStatus);

export default contactsRouter;
