import {
  contactCreateSchema,
  contactUpdateSchema,
  contactPatchSchema,
  contactFavoriteSchema
} from '../../src/schemas/contactsSchemas.js';
import { 
  TEST_CONTACTS, 
  TEST_PHONE_NUMBERS,
  createTestContact,
  createUniqueEmail 
} from '../helpers/testConstants.js';

describe('Contact Validation Schemas', () => {
  describe('contactCreateSchema', () => {
    it('should validate valid contact data', () => {
      const validContact = createTestContact();

      const { error } = contactCreateSchema.validate(validContact);
      expect(error).toBeUndefined();
    });

    it('should validate contact with all fields including favorite', () => {
      const validContact = createTestContact({ favorite: true });

      const { error } = contactCreateSchema.validate(validContact);
      expect(error).toBeUndefined();
    });

    it('should require name field', () => {
      const { error } = contactCreateSchema.validate(TEST_CONTACTS.MISSING_NAME);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should require email field', () => {
      const { error } = contactCreateSchema.validate(TEST_CONTACTS.MISSING_EMAIL);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should require phone field', () => {
      const { error } = contactCreateSchema.validate(TEST_CONTACTS.MISSING_PHONE);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phone');
    });

    it('should validate all valid E.164 phone formats', () => {
      TEST_PHONE_NUMBERS.VALID.forEach(phone => {
        const contact = createTestContact({ phone });
        const { error } = contactCreateSchema.validate(contact);
        expect(error).toBeUndefined();
      });
    });

    it('should reject all invalid phone formats', () => {
      TEST_PHONE_NUMBERS.INVALID.forEach(phone => {
        const contact = createTestContact({ phone });
        const { error } = contactCreateSchema.validate(contact);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('phone');
      });
    });

    it('should reject invalid email formats', () => {
      const { error } = contactCreateSchema.validate(TEST_CONTACTS.INVALID_EMAIL);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should validate email format', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+380671234567'
      };

      const { error } = contactCreateSchema.validate(invalidContact);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should validate name constraints', () => {
      const shortName = {
        name: 'J',  // too short
        email: 'john@example.com',
        phone: '+380671234567'
      };

      const { error } = contactCreateSchema.validate(shortName);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should reject empty object', () => {
      const { error } = contactCreateSchema.validate({});
      expect(error).toBeDefined();
      // Should require name, email, and phone
      expect(error.details.length).toBeGreaterThan(0);
    });

    it('should allow favorite field to be optional', () => {
      const contact = createTestContact();
      delete contact.favorite; // Remove favorite field
      
      const { error, value } = contactCreateSchema.validate(contact);
      expect(error).toBeUndefined();
      expect(value.favorite).toBeUndefined(); // Not set by default in validation
    });
  });

  describe('contactUpdateSchema (PUT - requires all fields)', () => {
    it('should validate complete contact data for PUT', () => {
      const completeUpdate = createTestContact();
      const { error } = contactUpdateSchema.validate(completeUpdate);
      expect(error).toBeUndefined();
    });

    it('should require name field for PUT', () => {
      const incompleteUpdate = {
        email: 'test@example.com',
        phone: '+380671234567'
        // missing name
      };
      const { error } = contactUpdateSchema.validate(incompleteUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should require email field for PUT', () => {
      const incompleteUpdate = {
        name: 'Test User',
        phone: '+380671234567'
        // missing email
      };
      const { error } = contactUpdateSchema.validate(incompleteUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should require phone field for PUT', () => {
      const incompleteUpdate = {
        name: 'Test User',
        email: 'test@example.com'
        // missing phone
      };
      const { error } = contactUpdateSchema.validate(incompleteUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phone');
    });

    it('should reject invalid email format', () => {
      const invalidUpdate = {
        ...createTestContact(),
        email: 'invalid-email'
      };
      const { error } = contactUpdateSchema.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject invalid phone format', () => {
      const invalidUpdate = {
        ...createTestContact(),
        phone: '1234567890' // without +
      };
      const { error } = contactUpdateSchema.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phone');
    });

    it('should allow favorite field to be optional', () => {
      const updateWithoutFavorite = createTestContact();
      delete updateWithoutFavorite.favorite;
      
      const { error } = contactUpdateSchema.validate(updateWithoutFavorite);
      expect(error).toBeUndefined();
    });
  });

  describe('contactPatchSchema (PATCH - partial updates)', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name'
      };
      const { error } = contactPatchSchema.validate(partialUpdate);
      expect(error).toBeUndefined();
    });

    it('should require at least one field', () => {
      const emptyUpdate = {};
      const { error } = contactPatchSchema.validate(emptyUpdate);
      expect(error).toBeDefined();
      expect(error.message).toContain('Request body must contain at least one field');
    });

    it('should validate optional phone with E.164 format', () => {
      const updateWithPhone = {
        phone: '+447987654321'
      };
      const { error } = contactPatchSchema.validate(updateWithPhone);
      expect(error).toBeUndefined();
    });

    it('should reject invalid optional phone format', () => {
      const updateWithInvalidPhone = {
        phone: '(555) 123-4567'
      };
      const { error } = contactPatchSchema.validate(updateWithInvalidPhone);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phone');
    });

    it('should validate only email update', () => {
      const emailOnly = {
        email: 'newemail@example.com'
      };
      const { error } = contactPatchSchema.validate(emailOnly);
      expect(error).toBeUndefined();
    });

    it('should validate only favorite update', () => {
      const favoriteOnly = {
        favorite: true
      };
      const { error } = contactPatchSchema.validate(favoriteOnly);
      expect(error).toBeUndefined();
    });
  });

  describe('contactFavoriteSchema', () => {
    it('should validate valid favorite field', () => {
      const valid = { favorite: true };
      const { error } = contactFavoriteSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('should reject missing favorite field', () => {
      const invalid = {};
      const { error } = contactFavoriteSchema.validate(invalid);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('favorite');
    });

    it('should reject non-boolean favorite', () => {
      const invalid = { favorite: 'yes' };
      const { error } = contactFavoriteSchema.validate(invalid);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('favorite');
    });
  });
});
