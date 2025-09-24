import { videoQueue } from '../../config/queue.js';
import { prisma } from '../../config/db.js';
import type { VideoRequest } from './video.model.js';


export async function requestVideo(userId: string, payload: VideoRequest) {
  const jobRow = await prisma.videoJob.create({
  data: { userId, status: 'PENDING', request: payload as any },
  });
  
  await videoQueue.add('generate', { videoJobId: jobRow.id }, { removeOnComplete: 100, removeOnFail: 100 });
  return jobRow;
}


export async function getJob(jobId: string) {
  return prisma.videoJob.findUnique({ where: { id: jobId } });
}

export async function listJobs(userId: string, params: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const [items, total] = await Promise.all([
    prisma.videoJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, status: true, progress: true, createdAt: true, updatedAt: true },
    }),
    prisma.videoJob.count({ where: { userId } }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}