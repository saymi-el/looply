import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as svc from './profile.service.js';

const ProfileSchema = z.object({
    displayName: z.string().optional(),
    brandColor: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    context: z.any().optional(),
});

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId as string;
    const profile = await svc.getProfile(userId);
    return reply.send({ profile });
}

export async function saveMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId as string;
    const data = ProfileSchema.parse(request.body);
    const profile = await svc.upsertProfile(userId, data);
    return reply.send({ profile });
}