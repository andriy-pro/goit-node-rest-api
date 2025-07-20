/**
 * Express.js застосунок - конфігурація та middleware
 * Не містить логіку запуску сервера - тільки налаштування Express app
 *
 * @fileoverview Express application configuration
 * @module app
 * @author Andriy Nechyporenko
 * @version 1.0.0 - Clean architecture approach
 * @license GPL-3.0
 */

import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Security HTTP headers
app.use(helmet());

// HTTP logging
app.use(morgan("tiny"));

// CORS middleware
app.use(cors());

// JSON parsing
app.use(express.json());

// API routes for contacts
app.use("/api/contacts", contactsRouter);

// API routes for authentication
app.use("/api/auth", authRouter);

// Handling 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized global error handler
app.use(errorHandler);

export default app;
