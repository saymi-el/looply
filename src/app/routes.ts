import { FastifyInstance } from 'fastify';
import authRouter from '../modules/auth/auth.routes.js';
import profileRouter from '../modules/profile/profile.routes.js';
import videoRouter from '../modules/video/video.routes.js';
import systemRouter from '../modules/system/system.routes.js';
import { webhookRoutes } from '../modules/webhook/webhook.routes.js';

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(authRouter, { prefix: '/auth' });
  await fastify.register(profileRouter, { prefix: '/profile' });
  await fastify.register(videoRouter, { prefix: '/video' });
  await fastify.register(webhookRoutes, { prefix: '/webhook' });
  await fastify.register(systemRouter, { prefix: '/' });
}