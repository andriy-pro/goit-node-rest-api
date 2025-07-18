/**
 * Test constants for API integration tests.
 */

import Contact from '../../src/models/Contact.js';

/**
 * Creates a valid test contact object with unique email and phone.
 * @param {object} overrides - Object to override default contact data.
 * @returns {object} The contact data object.
 */
export const createTestContact = (overrides = {}) => ({
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  phone: `+38099${Math.floor(1000000 + Math.random() * 9000000)}`,
  favorite: false,
  ...overrides,
});

/**
 * Creates a test contact in the database and returns the created contact instance.
 * @param {object} overrides - Object to override default contact data.
 * @returns {Promise<object>} The created contact instance from database.
 */
export const createTestContactInDb = async (overrides = {}) => {
  const contactData = createTestContact(overrides);
  return await Contact.create(contactData);
};

export const NON_EXISTENT_ID = '999999';
export const INVALID_ID_FORMAT = 'invalid-id';

export const TEST_CONTACTS = {
  VALID: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+380991112233',
    favorite: false
  },
  
  MISSING_EMAIL: {
    name: 'Test',
    phone: '+380991234567'
  },
  
  MISSING_PHONE: {
    name: 'Test',
    email: 'test@example.com'
  },
  
  MISSING_NAME: {
    email: 'test@example.com',
    phone: '+380991234567'
  },
  
  INVALID_EMAIL: {
    name: 'Test User',
    email: 'not-an-email',
    phone: '+380991234567'
  },
  
  INVALID_PHONE_NO_PLUS: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '0501234567' // без +
  },
  
  INVALID_PHONE_TOO_SHORT: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+123' // занадто короткий
  }
};

export const TEST_PHONE_NUMBERS = {
  VALID: [
    '+380671234567',
    '+12125551234', 
    '+447123456789',
    '+4915123456789'
  ],
  
  INVALID: [
    '(123) 456-7890',  // US format
    '0671234567',      // no country code
    '+123',            // too short
    '+123456789012345678', // too long
    'not-a-phone',     // not a number
    '+38-067-123-45-67' // with dashes
  ]
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Not found',
  INVALID_ID: 'is not a valid ID',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error'
};

// Utility функції для тестів
export const createUniqueEmail = (prefix = 'test') => {
  return `${prefix}-${Date.now()}@example.com`;
}; 