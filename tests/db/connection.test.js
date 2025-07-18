import { jest } from '@jest/globals';
import sequelize from '../../src/db/connection.js';
import { testConnection, syncDatabase } from '../../src/db/connection.js';

describe('Database Connection', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    // Spy on console methods to check output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock process.exit to prevent tests from stopping
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  describe('testConnection', () => {
    it('should log success message on successful connection', async () => {
      // Spy on the method and provide a fake resolved promise
      jest.spyOn(sequelize, 'authenticate').mockResolvedValue();
      await testConnection();
      expect(sequelize.authenticate).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Database connection successful');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log an error and exit on connection failure', async () => {
      const error = new Error('Connection failed');
      // Spy and provide a fake rejected promise
      jest.spyOn(sequelize, 'authenticate').mockRejectedValue(error);
      await testConnection();
      expect(sequelize.authenticate).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection error:', 'Connection failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('syncDatabase', () => {
    it('should log success message on successful sync', async () => {
      jest.spyOn(sequelize, 'sync').mockResolvedValue();
      await syncDatabase();
      expect(sequelize.sync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Models are synchronized with the database');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error on sync failure', async () => {
      const error = new Error('Sync failed');
      jest.spyOn(sequelize, 'sync').mockRejectedValue(error);
      await expect(syncDatabase()).rejects.toThrow('Sync failed');
      expect(sequelize.sync).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Model synchronization error:', 'Sync failed');
    });
  });
}); 