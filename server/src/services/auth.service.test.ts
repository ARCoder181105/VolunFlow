import { hashPassword, comparePassword } from './auth.service.js';

// Describe blocks group related tests
describe('Auth Service', () => {

  // A single test for the hashPassword function
  it('should correctly hash a password', async () => {
    const password = 'mySecretPassword123';
    const hashedPassword = await hashPassword(password);

    // We expect the hash to be defined and to be a string
    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
    // A hashed password should not be the same as the original
    expect(hashedPassword).not.toBe(password);
  });

  // A single test for the comparePassword function
  it('should correctly compare a valid password', async () => {
    const password = 'mySecretPassword123';
    const hashedPassword = await hashPassword(password);

    // We expect comparePassword to return true for the correct password
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  // A test for the failure case
  it('should correctly reject an invalid password', async () => {
    const password = 'mySecretPassword123';
    const hashedPassword = await hashPassword(password);

    // We expect comparePassword to return false for the wrong password
    const isMatch = await comparePassword('wrongPassword', hashedPassword);
    expect(isMatch).toBe(false);
  });

});