/**
 * Роутер для обробки API запитів до контактів
 * Налаштовує маршрути з валідацією та контролерами
 *
 * @fileoverview Express router for contacts API endpoints
 * @module contactsRouter
 * @author Andriy Nechyporenko
 * @version 1.0.0
 */

import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
} from "../controllers/contactsControllers.js";
import validateBody from "../helpers/validateBody.js";
import { contactCreateSchema, contactUpdateSchema } from "../schemas/contactsSchemas.js";

const contactsRouter = express.Router();

// GET /api/contacts - отримати всі контакти
contactsRouter.get("/", getAllContacts);

// GET /api/contacts/:id - отримати контакт за ID
contactsRouter.get("/:id", getOneContact);

// DELETE /api/contacts/:id - видалити контакт за ID
contactsRouter.delete("/:id", deleteContact);

// POST /api/contacts - створити новий контакт (з валідацією)
contactsRouter.post("/", validateBody(contactCreateSchema), createContact);

// PUT /api/contacts/:id - оновити контакт за ID (з валідацією)
contactsRouter.put("/:id", validateBody(contactUpdateSchema), updateContact);

export default contactsRouter;
