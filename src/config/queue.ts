import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env.js';

export const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});
export const videoQueue = new Queue('video', { connection });