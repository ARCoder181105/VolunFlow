import 'dotenv/config';
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan';

import uploadRoutes from './rest/upload.routes.js'

const app = express();

const url = process.env.FRONTEND_URL;
const origins = ['http://localhost:3000', ...(url ? [url] : [])];

//middlewares
app.use(cors({
  origin: origins,
  credentials: true,
}));
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

//cloudinary
app.use('/api/v1/upload', uploadRoutes); 

// --- Health Check Route ---
// A simple route to verify the server is running
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong! 🏓' });
});

// TODO: Setup Apollo Server for GraphQL here

export default app;