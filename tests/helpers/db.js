import { Contact } from '../../src/models/index.js';
import { createTestContact as createContactData } from './testConstants.js';

/**
 * Creates a test contact directly in the database.
 * @param {object} overrides - Object to override default contact data.
 * @returns {Promise<Contact>} The created contact instance.
 */
export const createTestContact = async (overrides = {}) => {
  const contactData = createContactData(overrides);
  return await Contact.create(contactData);
}; 