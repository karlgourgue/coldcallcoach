import './config/env';  // This import validates env vars
import express from 'express';
import serverless from 'serverless-http';
import apiRouter from './api';
import { corsMiddleware } from './config/cors';
import { errorHandler } from './api/middleware/errorHandler';

// Debug logging (will only show first few characters for security)
console.log('API Key loaded:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
} else if (process.env.OPENAI_API_KEY.includes('your_api')) {
  console.error('OPENAI_API_KEY is still set to placeholder value');
  process.exit(1);
}

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