import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/matchlens'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('matchlens'),
  FOOTBALL_PROVIDER: z.enum(['mock', 'football-data-org', 'api-football']).default('mock'),
  FOOTBALL_API_KEY: z.string().optional().default(''),
  AI_PROVIDER: z.enum(['mock', 'gemini', 'groq', 'openrouter']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('nvidia/nemotron-3-ultra-550b-a55b:free'),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  FOOTBALL_PROVIDER: process.env.FOOTBALL_PROVIDER,
  FOOTBALL_API_KEY: process.env.FOOTBALL_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_API_KEY: process.env.AI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
});
