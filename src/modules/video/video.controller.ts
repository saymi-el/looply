import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as svc from './video.service.js';

const ReqSchema = z.object({
    script: z.string().optional(),
    tone: z.string().optional(),
    duration: z.coerce.number().int().positive().max(300).optional(),
    format: z.string().optional(),
    platform: z.string().optional(),
    visualStyle: z.string().optional(),
    useModularGeneration: z.boolean().optional(),
    assets: z.array(z.number()).optional(),
});

const ListSchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export async function create(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId as string;
    const payload = ReqSchema.parse(request.body);
    const job = await svc.requestVideo(userId, payload);
    return reply.status(202).send({ jobId: job.id, status: job.status });
}

export async function status(request: FastifyRequest, reply: FastifyReply) {
    const job = await svc.getJob((request.params as any).id);
    if (!job) return reply.status(404).send({ error: 'Job not found' });
    return reply.send({ id: job.id, status: job.status, progress: job.progress, result: job.result, errorMessage: job.errorMessage });
}

export async function list(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId as string;
    const { page, pageSize } = ListSchema.parse(request.query);
    const data = await svc.listJobs(userId, { page, pageSize });
    return reply.send(data);
}