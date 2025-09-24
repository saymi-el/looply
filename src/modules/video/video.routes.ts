import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth/jwt.middleware.js';
import * as ctrl from './video.controller.js';

export default async function videoRoutes(fastify: FastifyInstance) {
  // Add auth middleware to all routes in this plugin
  await fastify.addHook('preHandler', requireAuth);

  fastify.post('/', {
    schema: {
      description: 'Request a video generation job',
      tags: ['Video'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          script: { type: 'string' },
          tone: { type: 'string' },
          duration: { type: 'string' },
          format: { type: 'string' },
          platform: { type: 'string' },
          assets: {
            type: 'array',
            items: { type: 'number' }
          }
        }
      },
      response: {
        202: {
          description: 'Job accepted',
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    }
  }, ctrl.create);

  fastify.get('/:id', {
    schema: {
      description: 'Get job status',
      tags: ['Video'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Job status returned',
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            progress: { type: 'number' },
            result: { type: 'object' }
          }
        }
      }
    }
  }, ctrl.status);

  fastify.get('/', {
    schema: {
      description: 'List my video jobs',
      tags: ['Video'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100 }
        }
      },
      response: {
        200: {
          description: 'Paginated list returned',
          type: 'object',
          properties: {
            jobs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, ctrl.list);
}