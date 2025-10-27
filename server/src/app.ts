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

const app = express();

async function startServer() {
  // --- Core Middleware ---
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  // app.use(helmet()); 
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
}

startServer();

export default app;