// Centralized environment loader to ensure dotenv runs before other modules access process.env
import dotenv from 'dotenv';

// Load environment variables once
dotenv.config();

// Helper to safely read required vars with optional fallback
const requireEnv = (key, { fallback, required = false } = {}) => {
  let value = process.env[key];
  if (!value && fallback) {
    value = fallback;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ENV WARNING] Using fallback for ${key}. Set it in your .env file.`);
    }
  }
  if (!value && required) {
    console.error(`[ENV ERROR] Missing required environment variable: ${key}`);
  }
  return value;
};

export const JWT_SECRET = requireEnv('JWT_SECRET', { fallback: process.env.NODE_ENV === 'production' ? undefined : 'dev_insecure_secret_change_me', required: true });
export const MONGODB_URI = requireEnv('MONGODB_URI', { required: true });
export const SMTP_USER = requireEnv('SMTP_USER');
export const SMTP_PASS = requireEnv('SMTP_PASS');
export const SENDER_EMAIL = requireEnv('SENDER_EMAIL');
export const BREVO_API_KEY = requireEnv('BREVO_API_KEY');
export const CLOUDINARY_CLOUD_NAME = requireEnv('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = requireEnv('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = requireEnv('CLOUDINARY_API_SECRET');
export const FRONTEND_ORIGIN = requireEnv('FRONTEND_ORIGIN');

// Export raw process.env for any remaining edge cases
export const ENV = process.env;
