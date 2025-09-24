import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createUser, login } from './auth.service.js';

const CredsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function signup(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = CredsSchema.parse(request.body);
    const user = await createUser(email, password);
    return reply.status(201).send({ id: user.id, email: user.email });
}

export async function signin(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = CredsSchema.parse(request.body);
    const { user, token } = await login(email, password);
    return reply.send({ token, user: { id: user.id, email: user.email } });
}