import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from './auth.service.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing Authorization header' });
    }

    const token = header.slice('Bearer '.length);

    try {
        const payload = verifyToken(token);
        (request as any).userId = payload.sub;
    } catch {
        return reply.status(401).send({ error: 'Invalid token' });
    }
}