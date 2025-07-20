/**
 * Схеми валідації для аутентифікації з використанням Joi
 * Забезпечує валідацію даних для реєстрації та входу користувачів
 *
 * @fileoverview Joi validation schemas for authentication API
 * @module authSchemas
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import Joi from "joi";

// Базові схеми валідації для аутентифікації
const baseAuthFields = {
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(100)
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email address cannot exceed 100 characters',
      'any.required': 'Email is a required field'
    }),

  password: Joi.string()
    .min(6)
    .max(100)
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 100 characters',
      'any.required': 'Password is a required field'
    })
};

/**
 * Схема валідації для реєстрації користувача (POST /api/auth/register)
 * Email та password обов'язкові
 */
export const registerSchema = Joi.object({
  email: baseAuthFields.email.required(),
  password: baseAuthFields.password.required()
});

/**
 * Схема валідації для входу користувача (POST /api/auth/login)
 * Email та password обов'язкові
 */
export const loginSchema = Joi.object({
  email: baseAuthFields.email.required(),
  password: baseAuthFields.password.required()
});

/**
 * Схема валідації для оновлення підписки (PATCH /api/auth/subscription)
 * Subscription має бути одним з дозволених значень
 */
export const subscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid('starter', 'pro', 'business')
    .required()
    .messages({
      'any.only': 'Subscription must be one of: starter, pro, business',
      'any.required': 'Subscription is a required field'
    })
}); 