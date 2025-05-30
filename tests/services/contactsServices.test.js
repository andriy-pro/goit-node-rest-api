import { jest } from '@jest/globals';

// Мокаємо fs/promises для тестування без реальних файлів
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.unstable_mockModule('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile
}));

// Імпортуємо функції для тестування ПІСЛЯ мокання
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact
} = await import('../../src/services/contactsServices.js');

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
    mockReadFile.mockReset();
    mockWriteFile.mockReset();
  });

  describe('listContacts', () => {
    it('should return array of all contacts', async () => {
      // Arrange - налаштовуємо мок
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      // Act - викликаємо функцію
      const result = await listContacts();

      // Assert - перевіряємо результат
      expect(result).toEqual(mockContacts);
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if file is empty', async () => {
      mockReadFile.mockResolvedValue('[]');

      const result = await listContacts();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle file read errors', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      await expect(listContacts()).rejects.toThrow('File not found');
    });
  });

  describe('getContactById', () => {
    it('should return contact when valid ID provided', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('1');

      expect(result).toEqual(mockContacts[0]);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Allen Raymond');
    });

    it('should return null when contact not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('999');

      expect(result).toBeNull();
    });

    it('should return null when invalid ID provided', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await getContactById('');

      expect(result).toBeNull();
    });
  });

  describe('removeContact', () => {
    it('should remove and return contact when valid ID provided', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));
      mockWriteFile.mockResolvedValue();

      const result = await removeContact('1');

      expect(result).toEqual(mockContacts[0]);
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    it('should return null when contact to remove not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      const result = await removeContact('999');

      expect(result).toBeNull();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });

  describe('addContact', () => {
    it('should add new contact with generated ID', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));
      mockWriteFile.mockResolvedValue();

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
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
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
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));
      mockWriteFile.mockResolvedValue();

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
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    it('should return null when contact to update not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));

      const updateData = { name: 'Updated Name' };
      const result = await updateContact('999', updateData);

      expect(result).toBeNull();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('should handle partial updates correctly', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockContacts));
      mockWriteFile.mockResolvedValue();

      const updateData = { phone: '+380999999999' };
      const result = await updateContact('1', updateData);

      expect(result.phone).toBe('+380999999999');
      expect(result.name).toBe('Allen Raymond'); // name залишається незмінним
      expect(result.email).toBe('nulla.ante@vestibul.co.uk'); // email залишається незмінним
    });
  });
});
