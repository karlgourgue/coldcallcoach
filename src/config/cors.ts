import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',     // Vite dev server
  'http://localhost:3000',     // Alternative local development
  'https://coldcallcoach.vercel.app',  // Production domain
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Export a configured CORS middleware instance
export const corsMiddleware = cors(corsOptions); 