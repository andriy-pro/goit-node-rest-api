import Joi from "joi";

// Розширений список дозволених доменів
const ALLOWED_EMAIL_DOMAINS = [
  // Популярні міжнародні домени
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
  // Країнові домени
  'ua', 'us', 'uk', 'ca', 'de', 'fr', 'it', 'es', 'nl', 'pl', 'cz', 'sk',
  // Популярні складені домени
  'co.uk', 'co.jp', 'co.in', 'co.za', 'com.au', 'com.br', 'com.mx',
  // Сучасні домени
  'io', 'ai', 'app', 'dev', 'tech', 'info', 'biz', 'name',
  // Домен, який я обрав для власного сайту: andriy.pro
  'pro'
];

// Базові схеми валідації
const baseContactFields = {
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\s.-]+$/)
    .messages({
      'string.min': 'Ім\'я має містити щонайменше 2 символи',
      'string.max': 'Ім\'я не може перевищувати 50 символів',
      'string.pattern.base': 'Ім\'я може містити лише літери, пробіли, апострофи, крапки та дефіси',
      'any.required': 'Ім\'я є обов\'язковим полем'
    }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ALLOWED_EMAIL_DOMAINS }
    })
    .max(100)
    .messages({
      'string.email': 'Будь ласка, введіть правильну електронну адресу',
      'string.max': 'Електронна адреса не може перевищувати 100 символів',
      'any.required': 'Електронна адреса є обов\'язковим полем'
    }),

  phone: Joi.string()
    .pattern(/^(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$|^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Телефон має бути у правильному форматі, наприклад: (123) 456-7890, +1234567890 або міжнародний формат',
      'any.required': 'Телефон є обов\'язковим полем'
    })
};

/**
 * Схема валідації для створення нового контакту (POST /api/contacts)
 * Всі поля обов'язкові (згідно з умовами завдання)
 */
export const contactCreateSchema = Joi.object({
  name: baseContactFields.name.required(),
  email: baseContactFields.email.required(),
  phone: baseContactFields.phone.required()
});

/**
 * Схема валідації для оновлення контакту (PUT /api/contacts/:id)
 * Жодне поле не обов'язкове, але хоча б одне має бути присутнє
 */
export const contactUpdateSchema = Joi.object({
  name: baseContactFields.name.optional(),
  email: baseContactFields.email.optional(),
  phone: baseContactFields.phone.optional()
}).min(1).messages({
  'object.min': 'Тіло запиту має містити хоча б одне поле'
});
