import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';

// Import your specific routers
import authRoutes from './rest/auth.routes.js';
import uploadRoutes from './rest/upload.routes.js';


const app = express();

// --- Core Middleware ---
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// --- API Version 1 Router ---
// All routes defined on apiV1Router will now be prefixed with /api/v1
const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/upload', uploadRoutes);

app.use('/api/v1', apiV1Router);

// Health Check Route for the main app
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong! 🏓' });
});

// --- Mount the main API router ---



// TODO: Setup Apollo Server to use the /api/v1/graphql path

export default app;