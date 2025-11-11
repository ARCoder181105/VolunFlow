import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';

// --- Apollo Server Imports ---
import { createApolloGraphQLMiddleware } from './config/apollo.js';

// --- REST Route Imports ---
import authRoutes from './rest/auth.routes.js';
import uploadRoutes from './rest/upload.routes.js';

// Create the Express app instance
const app = express();

/**
 * Sets up and configures the Express server.
 * This includes all middleware, routes, and GraphQL.
 */
export async function setupServer() {
  // --- Core Middleware ---
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  
  // Configure Helmet to allow Apollo Sandbox in development
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: {
  //       directives: {
  //         ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  //         "script-src-attr": ["'unsafe-inline'"],
  //         "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
  //       },
  //     },
  //   })
  // );
  
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  // --- API Version 1 Router ---
  const apiV1Router = Router();

  // Mount REST routes
  apiV1Router.use('/auth', authRoutes);
  apiV1Router.use('/upload', uploadRoutes);

  // Mount GraphQL Server
  apiV1Router.use('/graphql', await createApolloGraphQLMiddleware());

  // --- Mount the main API router ---
  app.use('/api/v1', apiV1Router);

  // --- Health Check ---
  app.get('/ping', (req, res) => res.status(200).json({ message: 'pong! 🏓' }));

  // Return the configured app
  return app;
}

// Export the app instance for testing and for server.ts
export default app;