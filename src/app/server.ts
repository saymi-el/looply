import 'dotenv/config';
import Fastify from 'fastify';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import { ZodError } from 'zod';
import routes from './routes.js';

const fastify = Fastify({ 
  logger: logger
});

// Register CORS plugin
await fastify.register(import('@fastify/cors'), {
  origin: env.NODE_ENV === 'production' && env.CORS_ORIGIN ? env.CORS_ORIGIN : true,
});

// Register Swagger plugin
await fastify.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Looply API',
      description: 'Video SaaS Backend API',
      version: '0.1.0'
    },
    servers: [
      {
        url: 'http://localhost:' + env.PORT,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
});

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true
});

// Health check route
fastify.get('/health', async (_request, reply) => {
  return reply.send({ ok: true, env: env.NODE_ENV });
});

// Register routes
await fastify.register(routes, { prefix: '/api/v1' });

// Global error handler
fastify.setErrorHandler(async (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: 'ValidationError',
      issues: error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }
  
  const status = error.statusCode ?? 500;
  logger.error({ err: error }, 'Unhandled error');
  return reply.status(status).send({ 
    error: error.message ?? 'Internal Server Error' 
  });
});

// 404 handler
fastify.setNotFoundHandler(async (_request, reply) => {
  return reply.status(404).send({ error: 'Not found' });
});

const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`Server listening on http://localhost:${env.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();