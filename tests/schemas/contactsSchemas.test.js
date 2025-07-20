/**
 * Тести для Joi схем валідації контактів
 * Покриває основні сценарії валідації
 *
 * @fileoverview Joi validation schemas tests
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { contactCreateSchema, contactUpdateSchema, contactFavoriteSchema } from '../../src/schemas/contactsSchemas.js';

// Допоміжна функція для створення тестових контактів
const createTestContact = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  phone: '+380991234567',
  ...overrides
});

describe('Contact Validation Schemas', () => {
  describe('contactCreateSchema', () => {
    it('should validate correct contact data', () => {
      const contact = createTestContact();
      const { error } = contactCreateSchema.validate(contact);
      expect(error).toBeUndefined();
    });

    it('should require all required fields', () => {
      const missingName = createTestContact({ name: undefined });
      const missingEmail = createTestContact({ email: undefined });
      const missingPhone = createTestContact({ phone: undefined });

      expect(contactCreateSchema.validate(missingName).error).toBeDefined();
      expect(contactCreateSchema.validate(missingEmail).error).toBeDefined();
      expect(contactCreateSchema.validate(missingPhone).error).toBeDefined();
    });

    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
      const invalidEmails = ['invalid-email', 'test@', '@example.com'];

      validEmails.forEach(email => {
        const contact = createTestContact({ email });
        expect(contactCreateSchema.validate(contact).error).toBeUndefined();
      });

      invalidEmails.forEach(email => {
        const contact = createTestContact({ email });
        expect(contactCreateSchema.validate(contact).error).toBeDefined();
      });
    });

    it('should validate phone format', () => {
      const validPhones = ['+380991234567', '+380501234567'];
      const invalidPhones = ['invalid-phone', '1234567890', '+123'];

      validPhones.forEach(phone => {
        const contact = createTestContact({ phone });
        expect(contactCreateSchema.validate(contact).error).toBeUndefined();
      });

      invalidPhones.forEach(phone => {
        const contact = createTestContact({ phone });
        expect(contactCreateSchema.validate(contact).error).toBeDefined();
      });
    });

    it('should validate name length', () => {
      const shortName = createTestContact({ name: 'A' });
      const longName = createTestContact({ name: 'A'.repeat(51) });

      expect(contactCreateSchema.validate(shortName).error).toBeDefined();
      expect(contactCreateSchema.validate(longName).error).toBeDefined();
    });

    it('should handle special characters in name', () => {
      const allowedNames = ['John-Doe', 'Mary Jane', "O'Connor"];

      allowedNames.forEach(name => {
        const contact = createTestContact({ name });
        expect(contactCreateSchema.validate(contact).error).toBeUndefined();
      });
    });

    it('should not allow owner field (set automatically)', () => {
      const contactWithOwner = createTestContact({ owner: 1 });
      expect(contactCreateSchema.validate(contactWithOwner).error).toBeDefined();
      expect(contactCreateSchema.validate(contactWithOwner).error.message).toContain('not allowed');
    });
  });

  describe('contactUpdateSchema', () => {
    it('should validate complete contact data', () => {
      const contact = createTestContact();
      const { error } = contactUpdateSchema.validate(contact);
      expect(error).toBeUndefined();
    });

    it('should reject partial updates', () => {
      const partialContact = { name: 'Updated Name' };
      const { error } = contactUpdateSchema.validate(partialContact);
      expect(error).toBeDefined();
    });

    it('should reject empty object', () => {
      const { error } = contactUpdateSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('contactFavoriteSchema', () => {
    it('should validate boolean favorite values', () => {
      expect(contactFavoriteSchema.validate({ favorite: true }).error).toBeUndefined();
      expect(contactFavoriteSchema.validate({ favorite: false }).error).toBeUndefined();
    });

    it('should require favorite field', () => {
      const { error } = contactFavoriteSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should reject non-boolean values', () => {
      const invalidValues = [
        { favorite: 'true' },
        { favorite: 1 },
        { favorite: 'yes' },
        { favorite: null }
      ];

      invalidValues.forEach(data => {
        const { error } = contactFavoriteSchema.validate(data);
        expect(error).toBeDefined();
      });
    });
  });
});
