import { Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import logger from '../config/logger.js';
import { generateScript } from '../modules/ai/script.service.js';
import { textToSpeech } from '../modules/ai/audio.service.js';
import { generateVisualAssets, type VisualPrompt } from '../modules/ai/model.service.js';
import { assembleVideo } from '../modules/ai/shotstack.service.js';


const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

type JobData = { videoJobId: string };

const worker = new Worker<JobData>('video', async (job: Job<JobData>) => {
const row = await prisma.videoJob.findUnique({ where: { id: job.data.videoJobId } });
if (!row) throw new Error('VideoJob not found');

await prisma.videoJob.update({ where: { id: row.id }, data: { status: 'RUNNING', progress: 0 } });

const steps: any[] = [];
try {
const request = row.request as any;

// Génération du script avec OpenAI
logger.info({ 
    topic: request.platform ?? 'contenu',
    tone: request.tone,
    duration: request.duration || 15 
}, 'Démarrage génération script avec OpenAI...');

const scriptData = request.script 
    ? { 
        text: request.script, 
        duration: 15, 
        videoPrompts: [] 
      }
    : await generateScript({
        topic: request.platform ?? 'contenu',
        tone: request.tone,
        context: request,
        duration: request.duration || 15
      });

logger.info({ 
    scriptLength: scriptData.text.length,
    duration: scriptData.duration,
    promptsCount: scriptData.videoPrompts.length,
    script: scriptData.text,
    videoPrompts: scriptData.videoPrompts
}, '✅ Script généré par OpenAI');

steps.push({ 
    name: 'script', 
    status: 'ok', 
    meta: { 
        length: scriptData.text.length, 
        duration: scriptData.duration,
        promptsCount: scriptData.videoPrompts.length,
        script: scriptData.text,
        videoPrompts: scriptData.videoPrompts
    } 
});
await job.updateProgress(20);

await prisma.videoJob.update({ where: { id: row.id }, data: { progress: 20 } });

// Génération de l'audio à partir du script
const tts = await textToSpeech(scriptData.text);
steps.push({ name: 'audio', status: 'ok', meta: { audioUrl: tts.audioUrl } });
await job.updateProgress(45);

await prisma.videoJob.update({ where: { id: row.id }, data: { progress: 45 } });

// Génération des visuels à partir des prompts WAN 2.2
const visuals = scriptData.videoPrompts.length > 0 
    ? await generateVisualAssets({ 
        prompts: scriptData.videoPrompts.map(p => ({
            positive: p.positive,
            negative: p.negative,
            timing: p.timing
        }))
      })
    : await generateVisualAssets({ prompt: scriptData.text.slice(0, 200) });
steps.push({ name: 'visuals', status: 'ok', meta: { count: visuals.assets.length } });
await job.updateProgress(70);

await prisma.videoJob.update({ where: { id: row.id }, data: { progress: 70 } });

const video = await assembleVideo({ 
    script: scriptData.text, 
    audioUrl: tts.audioUrl, 
    assets: visuals.assets,
    videoPrompts: scriptData.videoPrompts
});
steps.push({ name: 'assemble', status: 'ok', meta: { url: video.url } });
await job.updateProgress(100);

await prisma.videoJob.update({
    where: { id: row.id },
    data: { 
        status: 'COMPLETED', 
        progress: 100, 
        result: { 
            url: video.url, 
            steps,
            generatedScript: scriptData.text,
            videoPrompts: scriptData.videoPrompts,
            summary: `Script de ${scriptData.duration}s généré avec ${scriptData.videoPrompts.length} prompts visuels`
        } as any 
    },
});
} catch (err: any) {
    logger.error({ err }, 'Video job failed');
    await prisma.videoJob.update({
        where: { id: row.id },
        data: { status: 'FAILED', progress: 100, errorMessage: err?.message ?? 'unknown error' },
    });
    throw err;
}
}, { connection, concurrency: 1 });


const events = new QueueEvents('video', { connection });


events.on('progress', ({ jobId, data }) => {
logger.debug({ jobId, data }, 'progress');
});


events.on('completed', ({ jobId }) => logger.info({ jobId }, 'job completed'));


events.on('failed', ({ jobId, failedReason }) => logger.warn({ jobId, failedReason }, 'job failed'));


logger.info('Video worker up');

