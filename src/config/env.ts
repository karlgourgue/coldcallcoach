import 'dotenv/config';

// Environment variable validation
function validateEnv() {
  const requiredEnvVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Add other required env vars here
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate API key format
  if (process.env.OPENAI_API_KEY?.includes('your_api')) {
    throw new Error('OPENAI_API_KEY is still set to placeholder value');
  }

  // Log sensitive info securely (first few chars only)
  console.log('API Key loaded:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');
}

// Environment configuration object
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  // Add other env vars here
} as const;

// Validate environment variables on module import
validateEnv();

export default env; 