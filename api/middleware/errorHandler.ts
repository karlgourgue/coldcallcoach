import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Custom error class for validation errors
export class ValidationError extends APIError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

// Error handler middleware
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error caught in global handler:', err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File is too large. Maximum size is 25MB.'
      });
    }
    return res.status(400).json({ error: err.message });
  }

  // Handle custom API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Handle validation errors (e.g., file type validation)
  if (err.message === 'Only audio files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });

  next(err);
} 