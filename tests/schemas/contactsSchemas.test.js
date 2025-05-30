import { contactCreateSchema, contactUpdateSchema } from '../../src/schemas/contactsSchemas.js';

describe('Contact Validation Schemas', () => {
  describe('contactCreateSchema', () => {
    it('should validate valid contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+380671234567'
      };

      const { error } = contactCreateSchema.validate(validContact);
      expect(error).toBeUndefined();
    });

    it('should require all fields', () => {
      const invalidContact = {
        name: 'John Doe'
        // missing email and phone
      };

      const { error } = contactCreateSchema.validate(invalidContact);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should validate E.164 phone format', () => {
      const validPhones = ['+380671234567', '+12125551234', '+447123456789'];

      validPhones.forEach(phone => {
        const contact = {
          name: 'Test User',
          email: 'test@example.com',
          phone
        };
        const { error } = contactCreateSchema.validate(contact);
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '(123) 456-7890',  // US format
        '0671234567',      // no country code
        '+123',            // too short
        '+123456789012345678', // too long
        'not-a-phone'      // invalid format
      ];

      invalidPhones.forEach(phone => {
        const contact = {
          name: 'Test User',
          email: 'test@example.com',
          phone
        };
        const { error } = contactCreateSchema.validate(contact);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('phone');
      });
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
  });

  describe('contactUpdateSchema', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name'
      };

      const { error } = contactUpdateSchema.validate(partialUpdate);
      expect(error).toBeUndefined();
    });

    it('should require at least one field', () => {
      const emptyUpdate = {};

      const { error } = contactUpdateSchema.validate(emptyUpdate);
      expect(error).toBeDefined();
      expect(error.message).toContain('хоча б одне поле');
    });

    it('should validate optional phone with E.164 format', () => {
      const updateWithPhone = {
        phone: '+447987654321'
      };

      const { error } = contactUpdateSchema.validate(updateWithPhone);
      expect(error).toBeUndefined();
    });

    it('should reject invalid optional phone format', () => {
      const updateWithInvalidPhone = {
        phone: '(555) 123-4567'
      };

      const { error } = contactUpdateSchema.validate(updateWithInvalidPhone);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('phone');
    });
  });
});
