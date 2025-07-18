/**
 * Схеми валідації для контактів з використанням Joi
 * Забезпечує валідацію даних для створення та оновлення контактів
 *
 * @fileoverview Joi validation schemas for contacts API
 * @module contactsSchemas
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import Joi from "joi";

// Базові схеми валідації
const baseContactFields = {
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\s.-]+$/)
    .messages({
      'string.min': 'Name must contain at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'string.pattern.base': 'Name can only contain letters, spaces, apostrophes, dots and dashes',
      'any.required': 'Name is a required field'
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(100)
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email address cannot exceed 100 characters',
      'any.required': 'Email is a required field'
    }),

  phone: Joi.string()
    .pattern(/^\+[1-9]\d{6,14}$/)
    .messages({
      'string.pattern.base': 'Phone must be in international E.164 format: +380671234567, +12125551234',
      'any.required': 'Phone is a required field'
    }),

  favorite: Joi.boolean()
    .strict()
    .messages({
      'boolean.base': 'Favorite field must be a boolean value (true or false)',
      'any.required': 'Favorite field is required for this request'
    })
};

/**
 * Схема валідації для створення нового контакту (POST /api/contacts)
 * Всі базові поля обов'язкові, favorite опціонально (за замовчуванням false)
 */
export const contactCreateSchema = Joi.object({
  name: baseContactFields.name.required(),
  email: baseContactFields.email.required(),
  phone: baseContactFields.phone.required(),
  favorite: baseContactFields.favorite.optional()
});

/**
 * Схема валідації для повного оновлення контакту (PUT /api/contacts/:id)
 * Всі основні поля обов'язкові для PUT запитів
 */
export const contactUpdateSchema = Joi.object({
  name: baseContactFields.name.required(),
  email: baseContactFields.email.required(),
  phone: baseContactFields.phone.required(),
  favorite: baseContactFields.favorite.optional()
});

/**
 * Схема валідації для часткового оновлення контакту (PATCH /api/contacts/:id)
 * Жодне поле не обов'язкове, але хоча б одне має бути присутнє
 */
export const contactPatchSchema = Joi.object({
  name: baseContactFields.name.optional(),
  email: baseContactFields.email.optional(),
  phone: baseContactFields.phone.optional(),
  favorite: baseContactFields.favorite.optional()
}).min(1).messages({
  'object.min': 'Request body must contain at least one field'
});

/**
 * Схема валідації для оновлення статусу favorite (PATCH /api/contacts/:id/favorite)
 * Тільки поле favorite обов'язкове, додаткові поля заборонені
 */
export const contactFavoriteSchema = Joi.object({
  favorite: baseContactFields.favorite.required()
}).strict();
