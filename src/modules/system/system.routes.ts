import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db.js';
import { connection as redis } from '../../config/queue.js';

export default async function systemRoutes(fastify: FastifyInstance) {
  fastify.get('/health', {
    schema: {
      description: 'Liveness probe (process en vie)',
      tags: ['System'],
      security: [],
      response: {
        200: {
          description: 'Le process tourne',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            uptime: { type: 'number', example: 12.34 }
          }
        }
      }
    }
  }, async (_request, reply) => {
    return reply.send({ ok: true, uptime: process.uptime() });
  });

  fastify.get('/ready', {
    schema: {
      description: 'Readiness probe (DB & Redis OK)',
      tags: ['System'],
      security: [],
      response: {
        200: {
          description: 'Toutes les dépendances sont prêtes',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true }
          }
        },
        503: {
          description: 'Une dépendance est KO (DB/Redis)',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Redis ping failed' }
          }
        }
      }
    }
  }, async (_request, reply) => {
    try {
      // DB check
      await prisma.$queryRawUnsafe('SELECT 1');
      // Redis check
      const pong = await redis.ping();
      if (pong !== 'PONG') throw new Error('Redis ping failed');

      return reply.send({ ok: true });
    } catch (err: any) {
      return reply.status(503).send({ ok: false, error: err?.message ?? 'not ready' });
    }
  });
}
