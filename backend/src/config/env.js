import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set`);
  }
}

export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/api-client',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
