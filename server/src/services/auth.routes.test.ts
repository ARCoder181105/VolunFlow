import { jest } from '@jest/globals';
import request from 'supertest';
import app, { setupServer } from '../app.js';
import prisma from '../services/prisma.service.js';

// --- WARNING ---
// These tests run against your *actual* database.
// They will CREATE and DELETE users.
// Do not run this on a production database!

jest.setTimeout(30000);

let server;

// Setup: Start the server and clean the database before tests
beforeAll(async () => {
  server = await setupServer();
  // Clear all user and NGO data before starting
  await prisma.nGO.deleteMany();
  await prisma.user.deleteMany();
});

// Teardown: Clean the database after each test
afterEach(async () => {
  await prisma.nGO.deleteMany();
  await prisma.user.deleteMany();
});

// Teardown: Disconnect from Prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth REST API (/api/v1/auth)', () => {

  describe('POST /register', () => {
    it('should register a new user successfully with a 201 status', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Check HTTP status
      expect(response.status).toBe(201);
      
      // Check response body
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.password).toBeUndefined(); // Ensure password is NOT returned

      // Check if cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail to register a duplicate email with a 409 status', async () => {
      // First, create the user
      await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

      // Then, try to create the same user again
      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'AnotherPassword!',
      });

      // Check for conflict
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User with this email already exists.');
    });
  });

  describe('POST /login', () => {
    // We need to register the user before we can test login
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'LoginPass123!',
      });
    });

    it('should log in a valid user successfully with a 200 status', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('login@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject an invalid password with a 401 status', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WRONG_PASSWORD',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });
  });
});