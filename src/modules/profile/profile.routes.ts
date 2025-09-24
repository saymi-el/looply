import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth/jwt.middleware.js';
import * as ctrl from './profile.controller.js';

export default async function profileRoutes(fastify: FastifyInstance) {
  // Add auth middleware to all routes in this plugin
  await fastify.addHook('preHandler', requireAuth);

  fastify.get('/me', {
    schema: {
      description: 'Get my profile',
      tags: ['Profile'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Profile returned',
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            brandColor: { type: 'string' },
            avatarUrl: { type: 'string' },
            context: { type: 'object' }
          }
        }
      }
    }
  }, ctrl.getMe);

  fastify.put('/me', {
    schema: {
      description: 'Update my profile',
      tags: ['Profile'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },
          brandColor: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
          context: { type: 'object' }
        }
      },
      response: {
        200: {
          description: 'Updated',
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, ctrl.saveMe);
}