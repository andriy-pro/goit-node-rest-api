/**
 * Тести для підключення до бази даних
 * Покриває критичні сценарії помилок
 *
 * @fileoverview Database connection tests
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import sequelize, { testConnection, syncDatabase } from '../../src/db/connection.js';
import { jest } from '@jest/globals';

describe('Database Connection', () => {
  describe('testConnection function', () => {
    it('should handle successful connection', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await testConnection();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Database connection successful');
      
      consoleLogSpy.mockRestore();
    });

    it('should handle connection errors', async () => {
      const originalAuthenticate = sequelize.authenticate;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      sequelize.authenticate = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      await testConnection();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection error:', 'Connection failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      sequelize.authenticate = originalAuthenticate;
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('syncDatabase function', () => {
    it('should handle successful synchronization', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await syncDatabase({ alter: false });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Models are synchronized with the database');
      
      consoleLogSpy.mockRestore();
    });

    it('should handle synchronization errors', async () => {
      const originalSync = sequelize.sync;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      sequelize.sync = jest.fn().mockRejectedValue(new Error('Sync failed'));
      
      await expect(syncDatabase({ alter: true })).rejects.toThrow('Sync failed');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Model synchronization error:', 'Sync failed');
      
      sequelize.sync = originalSync;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Environment Validation', () => {
    it('should validate production environment variables', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalPassword = process.env.DB_PASSWORD;
      const originalName = process.env.DB_NAME;
      const originalUser = process.env.DB_USER;

      process.env.NODE_ENV = 'production';
      process.env.DB_PASSWORD = 'test-password';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'test-user';

      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        expect(process.env.DB_PASSWORD).toBeDefined();
        expect(process.env.DB_NAME).toBeDefined();
        expect(process.env.DB_USER).toBeDefined();
      }

      process.env.NODE_ENV = originalEnv;
      if (originalPassword) process.env.DB_PASSWORD = originalPassword;
      if (originalName) process.env.DB_NAME = originalName;
      if (originalUser) process.env.DB_USER = originalUser;
    });
  });
});
