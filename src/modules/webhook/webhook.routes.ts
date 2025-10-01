import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/db';
import { logger } from '../../config/logger';
import { vastService } from '../vast';
import type { VastWebhookPayload } from '../vast/vast.types';

/**
 * Webhook routes for receiving callbacks from external services
 */
export const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/webhook/vast
   * Receive video generation completion callback from Vast.ai
   */
  fastify.post<{
    Body: VastWebhookPayload;
    Headers: {
      'x-vast-signature'?: string;
    };
  }>('/vast', async (request, reply) => {
    const payload = request.body;
    const signature = request.headers['x-vast-signature'];

    logger.info('Received Vast.ai webhook', {
      vastJobId: payload.vastJobId,
      videoJobId: payload.videoJobId,
      status: payload.status,
    } as any);

    // Verify webhook signature for security
    if (signature && !vastService.verifyWebhookSignature(JSON.stringify(payload), signature)) {
      logger.warn('Invalid webhook signature', { vastJobId: payload.vastJobId } as any);
      return reply.code(401).send({ error: 'Invalid signature' });
    }

    try {
      // Find the video job
      const videoJob = await prisma.videoJob.findUnique({
        where: { id: payload.videoJobId },
      });

      if (!videoJob) {
        logger.error('Video job not found', { videoJobId: payload.videoJobId } as any);
        return reply.code(404).send({ error: 'Video job not found' });
      }

            // Update video job based on status
      if (payload.status === 'completed' && payload.videoUrl) {
        await prisma.videoJob.update({
          where: { id: payload.videoJobId },
          data: {
            status: 'COMPLETED',
            progress: 100,
            videoUrl: payload.videoUrl,
            vastJobId: payload.vastJobId,
            cloudProvider: payload.cloudProvider || 's3',
            metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
          },
        });

        logger.info('Video job completed successfully', {
          videoJobId: payload.videoJobId,
          videoUrl: payload.videoUrl,
          vastJobId: payload.vastJobId,
        } as any);
      } else if (payload.status === 'failed') {
        await prisma.videoJob.update({
          where: { id: payload.videoJobId },
          data: {
            status: 'FAILED',
            errorMessage: payload.error || 'Video generation failed',
            vastJobId: payload.vastJobId,
          },
        });

        logger.error('Video job failed', {
          videoJobId: payload.videoJobId,
          error: payload.error,
          vastJobId: payload.vastJobId,
        } as any);
      } else if (payload.status === 'processing') {
        // Optional: Update progress if Vast.ai sends processing updates
        logger.info('Video job still processing', {
          videoJobId: payload.videoJobId,
          vastJobId: payload.vastJobId,
        } as any);
      }

      return reply.send({ success: true, message: 'Webhook processed' });
    } catch (error) {
      logger.error('Error processing Vast.ai webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        payload,
      } as any);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};
