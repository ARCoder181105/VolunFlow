import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

// --- Apollo Server Imports ---
import { createApolloGraphQLMiddleware } from "./config/apollo.js";

// --- REST Route Imports ---
import authRoutes from "./rest/auth.routes.js";
import uploadRoutes from "./rest/upload.routes.js";

// Create the Express app instance
const app = express();

const CLIENT_URL = process.env.CLIENT_URL;
/**
 * Sets up and configures the Express server.
 * This includes all middleware, routes, and GraphQL.
 */

export async function setupServer() {
  const isProduction = process.env.NODE_ENV === "production";
  
  // --- Core Middleware ---
  app.use(
    cors({
      // *** THIS IS THE FIX ***
      // Use your CLIENT_URL from .env, not the backend URL
      origin: [CLIENT_URL, "http://localhost:5173"].filter((o): o is string => Boolean(o)),
      credentials: true, // Important for cookies
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );

  // Re-enable Helmet with the correct configuration
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: isProduction
  //       ? undefined // Use Helmet's secure defaults in production
  //       : { // Loosen CSP for Apollo Sandbox in development
  //           directives: {
  //             ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  //             "script-src-attr": ["'unsafe-inline'"],
  //             "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
  //           },
  //         },
  //     // This is VITAL for services like Google OAuth popups to work
  //     crossOriginEmbedderPolicy: false,
  //     crossOriginOpenerPolicy: false,
  //   })
  // );

  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  // --- API Version 1 Router ---
  const apiV1Router = Router();

  // Mount REST routes
  apiV1Router.use("/auth", authRoutes);
  apiV1Router.use("/upload", uploadRoutes);

  // Mount GraphQL Server
  apiV1Router.use("/graphql", await createApolloGraphQLMiddleware());

  // --- Mount the main API router ---
  app.use("/api/v1", apiV1Router);

  // --- Health Check ---
  app.get("/ping", (req, res) => res.status(200).json({ message: "pong! 🏓" }));

  // Return the configured app
  return app;
}

// Export the app instance for testing and for server.ts
export default app;