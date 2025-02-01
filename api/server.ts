import '../src/config/env';  // This import validates env vars
import express from 'express';
import serverless from 'serverless-http';
import { corsMiddleware } from '../src/config/cors';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Mount API routes
app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

// Export the serverless handler
export default serverless(app); 