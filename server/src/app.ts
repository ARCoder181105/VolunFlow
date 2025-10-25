import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import your specific routers
import uploadRoutes from './rest/upload.routes.js';


const app = express();

// --- Core Middleware ---
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- API Version 1 Router ---
// Create a new router for all v1 endpoints
const apiV1Router = Router();

apiV1Router.use('/upload', uploadRoutes); // Endpoint will be /api/v1/upload

// Health Check Route for the main app
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong! 🏓' });
});

// --- Mount the main API router ---
// All routes defined on apiV1Router will now be prefixed with /api/v1
app.use('/api/v1', apiV1Router);

// TODO: Setup Apollo Server to use the /api/v1/graphql path

export default app;