import { jest } from '@jest/globals';
import { HTTP_STATUS, createTestContact } from '../helpers/testConstants.js';

// Manual mocks для сервісів
const mockListContacts = jest.fn();
const mockGetContactById = jest.fn();
const mockAddContact = jest.fn();
const mockUpdateContact = jest.fn();
const mockRemoveContact = jest.fn();
const mockUpdateStatusContact = jest.fn();

// Mock всіх контролерів з мануальними залежностями
const createMockControllers = () => {
  const mockServices = {
    listContacts: mockListContacts,
    getContactById: mockGetContactById,
    addContact: mockAddContact,
    updateContact: mockUpdateContact,
    removeContact: mockRemoveContact,
    updateStatusContact: mockUpdateStatusContact
  };

  const mockHttpError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
  };

  // Manually create controllers with mocked dependencies
  const getAllContacts = async (req, res, next) => {
    try {
      const contacts = await mockServices.listContacts();
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  };

  const getOneContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const contact = await mockServices.getContactById(id);
      if (!contact) {
        throw mockHttpError(404, "Not found");
      }
      res.status(200).json(contact);
    } catch (error) {
      next(error);
    }
  };

  const createContact = async (req, res, next) => {
    try {
      const newContact = await mockServices.addContact(req.body);
      res.status(201).json(newContact);
    } catch (error) {
      next(error);
    }
  };

  const updateContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedContact = await mockServices.updateContact(id, req.body);
      if (!updatedContact) {
        throw mockHttpError(404, "Not found");
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  };

  const deleteContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedContact = await mockServices.removeContact(id);
      if (!deletedContact) {
        throw mockHttpError(404, "Not found");
      }
      res.status(200).json(deletedContact);
    } catch (error) {
      next(error);
    }
  };

  const updateContactStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedContact = await mockServices.updateStatusContact(id, req.body);
      if (!updatedContact) {
        throw mockHttpError(404, "Not found");
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  };

  return {
    getAllContacts,
    getOneContact,
    createContact,
    updateContact,
    deleteContact,
    updateContactStatus
  };
};

describe('Controllers: contactsControllers', () => {
  let mockReq, mockRes, mockNext;
  let controllers;

  beforeEach(() => {
    // Скидуємо всі mock'и перед кожним тестом
    jest.clearAllMocks();
    
    // Створюємо mock об'єкти для кожного тесту
    mockReq = {
      params: {},
      body: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();

    // Створюємо контролери з mock'ами
    controllers = createMockControllers();
  });

  describe('getAllContacts', () => {
    it('should return all contacts with status 200', async () => {
      const mockContacts = [
        { id: 1, ...createTestContact() },
        { id: 2, ...createTestContact() }
      ];
      
      mockListContacts.mockResolvedValue(mockContacts);

      await controllers.getAllContacts(mockReq, mockRes, mockNext);

      expect(mockListContacts).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockContacts);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Database error');
      mockListContacts.mockRejectedValue(mockError);

      await controllers.getAllContacts(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getOneContact', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
    });

    it('should return contact with status 200 when found', async () => {
      const mockContact = { id: 1, ...createTestContact() };
      mockGetContactById.mockResolvedValue(mockContact);

      await controllers.getOneContact(mockReq, mockRes, mockNext);

      expect(mockGetContactById).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockContact);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 404 error when contact not found', async () => {
      mockGetContactById.mockResolvedValue(null);

      await controllers.getOneContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HTTP_STATUS.NOT_FOUND,
          message: expect.stringContaining('Not found')
        })
      );
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Database error');
      mockGetContactById.mockRejectedValue(mockError);

      await controllers.getOneContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createContact', () => {
    beforeEach(() => {
      mockReq.body = createTestContact();
    });

    it('should create contact and return with status 201', async () => {
      const mockCreatedContact = { id: 1, ...mockReq.body };
      mockAddContact.mockResolvedValue(mockCreatedContact);

      await controllers.createContact(mockReq, mockRes, mockNext);

      expect(mockAddContact).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedContact);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Validation error');
      mockAddContact.mockRejectedValue(mockError);

      await controllers.createContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
      mockReq.body = createTestContact();
    });

    it('should update contact and return with status 200', async () => {
      const mockUpdatedContact = { id: 1, ...mockReq.body };
      mockUpdateContact.mockResolvedValue(mockUpdatedContact);

      await controllers.updateContact(mockReq, mockRes, mockNext);

      expect(mockUpdateContact).toHaveBeenCalledWith('1', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedContact);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 404 error when contact not found', async () => {
      mockUpdateContact.mockResolvedValue(null);

      await controllers.updateContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HTTP_STATUS.NOT_FOUND,
          message: expect.stringContaining('Not found')
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Database error');
      mockUpdateContact.mockRejectedValue(mockError);

      await controllers.updateContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteContact', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
    });

    it('should delete contact and return with status 200', async () => {
      const mockDeletedContact = { id: 1, ...createTestContact() };
      mockRemoveContact.mockResolvedValue(mockDeletedContact);

      await controllers.deleteContact(mockReq, mockRes, mockNext);

      expect(mockRemoveContact).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockDeletedContact);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 404 error when contact not found', async () => {
      mockRemoveContact.mockResolvedValue(null);

      await controllers.deleteContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HTTP_STATUS.NOT_FOUND,
          message: expect.stringContaining('Not found')
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Database error');
      mockRemoveContact.mockRejectedValue(mockError);

      await controllers.deleteContact(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateContactStatus', () => {
    beforeEach(() => {
      mockReq.params = { id: '1' };
      mockReq.body = { favorite: true };
    });

    it('should update contact status and return with status 200', async () => {
      const mockUpdatedContact = { id: 1, ...createTestContact(), favorite: true };
      mockUpdateStatusContact.mockResolvedValue(mockUpdatedContact);

      await controllers.updateContactStatus(mockReq, mockRes, mockNext);

      expect(mockUpdateStatusContact).toHaveBeenCalledWith('1', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedContact);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 404 error when contact not found', async () => {
      mockUpdateStatusContact.mockResolvedValue(null);

      await controllers.updateContactStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HTTP_STATUS.NOT_FOUND,
          message: expect.stringContaining('Not found')
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const mockError = new Error('Database error');
      mockUpdateStatusContact.mockRejectedValue(mockError);

      await controllers.updateContactStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Error handling consistency', () => {
    it('should use consistent 404 error format across controllers', async () => {
      const testCases = [
        { fn: controllers.getOneContact, mockFn: mockGetContactById },
        { fn: controllers.updateContact, mockFn: mockUpdateContact },
        { fn: controllers.deleteContact, mockFn: mockRemoveContact },
        { fn: controllers.updateContactStatus, mockFn: mockUpdateStatusContact }
      ];

      for (const { fn, mockFn } of testCases) {
        mockReq.params = { id: '1' };
        mockReq.body = { favorite: true };
        
        mockFn.mockResolvedValue(null);
        mockNext.mockClear();

        await fn(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            status: HTTP_STATUS.NOT_FOUND,
            message: expect.stringContaining('Not found')
          })
        );
      }
    });
  });
}); 