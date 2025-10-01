import 'dotenv/config';
import { z } from 'zod';


const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().url(),
    JWT_SECRET: z.string().min(8),
    OPENAI_API_KEY: z.string().optional(),
    SHOTSTACK_API_KEY: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    WAN_ENDPOINT: z.string().optional(),
    WAN_API_KEY: z.string().optional(),
    CORS_ORIGIN: z.string().optional(),
    VAST_API_URL: z.string().url().optional(),
    VAST_API_KEY: z.string().optional(),
    VAST_WEBHOOK_SECRET: z.string().optional(),
});


export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;