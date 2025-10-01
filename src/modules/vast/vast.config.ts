import { env } from '../../config/env';
import type { VastConfig } from './vast.types';

/**
 * Vast.ai configuration
 */
export const vastConfig: VastConfig = {
  apiUrl: env.VAST_API_URL || 'http://localhost:8000',
  apiKey: env.VAST_API_KEY,
  webhookSecret: env.VAST_WEBHOOK_SECRET,
  timeout: 30000, // 30 seconds
};

/**
 * Check if Vast.ai is properly configured
 */
export const isVastConfigured = (): boolean => {
  return Boolean(env.VAST_API_URL);
};
