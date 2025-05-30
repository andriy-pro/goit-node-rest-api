import { jest } from '@jest/globals';
import fs from 'fs/promises';

// Імпортуємо функції для тестування (поки що будуть помилки - це нормально для RED фази)
import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact
} from '../../services/contactsServices.js';

// Мокаємо fs/promises для тестування без реальних файлів
jest.mock('fs/promises');

describe('Contacts Services', () => {
  const mockContacts = [
    {
      id: '1',
      name: 'Allen Raymond',
      email: 'nulla.ante@vestibul.co.uk',
      phone: '(992) 914-3792'
    },
    {
      id: '2',
      name: 'Chaim Lewis',
      email: 'dui.in@egetlacus.ca',
      phone: '(294) 840-6685'
    },
    {
      id: '3',
      name: 'Kennedy Lane',
      email: 'mattis.Cras@nonenimMauris.net',
      phone: '(542) 451-7038'
    }
  ];

  beforeEach(() => {
    // Скидаємо всі моки перед кожним тестом
    jest.clearAllMocks();
  });

  describe('listContacts', () => {
    it('should return array of all contacts', async () => {
      // Arrange - налаштовуємо мок
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      // Act - викликаємо функцію
      const result = await listContacts();

      // Assert - перевіряємо результат
      expect(result).toEqual(mockContacts);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if file is empty', async () => {
      fs.readFile.mockResolvedValue('[]');

      const result = await listContacts();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(listContacts()).rejects.toThrow('File not found');
    });
  });

  describe('getContactById', () => {
    it('should return contact when valid ID provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('1');

      expect(result).toEqual(mockContacts[0]);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Allen Raymond');
    });

    it('should return null when contact not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('999');

      expect(result).toBeNull();
    });

    it('should return null when invalid ID provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('');

      expect(result).toBeNull();
    });
  });

  describe('removeContact', () => {
    it('should remove and return contact when valid ID provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));
      fs.writeFile.mockResolvedValue();

      const result = await removeContact('1');

      expect(result).toEqual(mockContacts[0]);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should return null when contact to remove not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await removeContact('999');

      expect(result).toBeNull();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('addContact', () => {
    it('should add new contact with generated ID', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));
      fs.writeFile.mockResolvedValue();

      const newContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+380123456789'
      };

      const result = await addContact(newContact);

      expect(result).toMatchObject(newContact);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should handle missing required fields', async () => {
      const invalidContact = {
        name: 'John Doe'
        // missing email and phone
      };

      await expect(addContact(invalidContact)).rejects.toThrow();
    });
  });

  describe('updateContact', () => {
    it('should update existing contact and return updated contact', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));
      fs.writeFile.mockResolvedValue();

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await updateContact('1', updateData);

      expect(result).toMatchObject({
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '(992) 914-3792' // phone залишається незмінним
      });
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should return null when contact to update not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));

      const updateData = { name: 'Updated Name' };
      const result = await updateContact('999', updateData);

      expect(result).toBeNull();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle partial updates correctly', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockContacts));
      fs.writeFile.mockResolvedValue();

      const updateData = { phone: '+380999999999' };
      const result = await updateContact('1', updateData);

      expect(result.phone).toBe('+380999999999');
      expect(result.name).toBe('Allen Raymond'); // name залишається незмінним
      expect(result.email).toBe('nulla.ante@vestibul.co.uk'); // email залишається незмінним
    });
  });
});
