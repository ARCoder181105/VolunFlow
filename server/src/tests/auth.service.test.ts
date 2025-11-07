import { jest } from '@jest/globals';
import { hashPassword, comparePassword } from '../services/auth.service.js';

describe('Auth Service', () => {

  describe('hashPassword and comparePassword', () => {
    it('should correctly hash a password', async () => {
      const password = 'mySecretPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
    });

    it('should correctly compare a valid password', async () => {
      const password = 'mySecretPassword123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should correctly reject an invalid password', async () => {
      const password = 'mySecretPassword123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword('wrongPassword', hashedPassword);
      
      expect(isMatch).toBe(false);
    });
  });
});