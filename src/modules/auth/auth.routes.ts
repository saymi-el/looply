import { FastifyInstance } from 'fastify';
import * as ctrl from './auth.controller.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register rate limiting for auth routes
  await fastify.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '15 minutes'
  });

  fastify.post('/signup', {
    schema: {
      description: 'Create a user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      response: {
        201: {
          description: 'Created',
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }, ctrl.signup);

  fastify.post('/login', {
    schema: {
      description: 'Login and get a JWT',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      response: {
        200: {
          description: 'JWT issued',
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, ctrl.signin);
}