import pino from 'pino';
import { env } from './env.js';


const isDev = env.NODE_ENV !== 'production';


export const logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});


export default logger;