import { logger } from '../../config/logger';
import { vastConfig, isVastConfigured } from './vast.config';
import type { VastRequest, VastResponse, VideoPrompt } from './vast.types';

/**
 * Vast.ai video generation service
 */
export class VastService {
  /**
   * Send video prompts to Vast.ai instance for generation
   */
  async sendToVast(
    videoJobId: string,
    duration: number,
    videoPrompts: VideoPrompt[],
    webhookUrl?: string
  ): Promise<VastResponse> {
    logger.info('Sending video generation request to Vast.ai', {
      videoJobId,
      duration,
      promptsCount: videoPrompts.length,
      vastApiUrl: vastConfig.apiUrl,
    } as any);

    if (!isVastConfigured()) {
      logger.warn('Vast.ai is not configured, using mock response');
      return this.mockVastResponse(videoJobId);
    }

    const request: VastRequest = {
      videoJobId,
      duration,
      videoPrompts,
      webhookUrl,
    };

    try {
      const response = await fetch(`${vastConfig.apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(vastConfig.apiKey && { 'Authorization': `Bearer ${vastConfig.apiKey}` }),
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(vastConfig.timeout || 30000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vast.ai API error: ${response.status} - ${errorText}`);
      }

      const data: VastResponse = await response.json();

      logger.info('Successfully sent request to Vast.ai', {
        videoJobId,
        vastJobId: data.vastJobId,
        estimatedCompletionTime: data.estimatedCompletionTime,
      } as any);

      return data;
    } catch (error) {
      logger.error('Failed to send request to Vast.ai', {
        videoJobId,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as any);
      throw error;
    }
  }

  /**
   * Mock response for testing without Vast.ai instance
   */
  private mockVastResponse(videoJobId: string): VastResponse {
    return {
      success: true,
      vastJobId: `mock-vast-${videoJobId}`,
      message: 'Mock response - Vast.ai not configured',
      estimatedCompletionTime: 300, // 5 minutes
    };
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!vastConfig.webhookSecret) {
      logger.warn('Webhook secret not configured, skipping verification');
      return true;
    }

    // TODO: Implement actual signature verification (e.g., HMAC)
    // This is a placeholder for when you configure the webhook secret
    return signature === vastConfig.webhookSecret;
  }
}

export const vastService = new VastService();
