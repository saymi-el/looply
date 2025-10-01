import { Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import logger from '../config/logger.js';
import { generateScript } from '../modules/ai/script/script.service.js';
import { vastService, isVastConfigured } from '../modules/vast/index.js';
import { textToSpeech } from '../modules/ai/audio/audio.service.js';
import { generateVisualAssets, type VisualPrompt } from '../modules/ai/visual/model.service.js';
import { assembleVideo } from '../modules/ai/video/shotstack.service.js';


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
}, 'Starting script generation with OpenAI');

const scriptData = request.script 
    ? { 
        text: request.script, 
        duration: request.duration || 15, 
        videoPrompts: [] 
      }
    : await generateScript({
        topic: request.platform ?? 'contenu',
        tone: request.tone,
        context: request,
        duration: request.duration || 15,
        visualStyle: request.visualStyle || 'professional',
        useModularGeneration: true
      });

logger.info({ 
    scriptLength: scriptData.text.length,
    duration: scriptData.duration,
    promptsCount: scriptData.videoPrompts.length,
    script: scriptData.text,
    videoPrompts: scriptData.videoPrompts
}, 'Script generated successfully');

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

// Check if Vast.ai is configured
if (isVastConfigured()) {
    logger.info('Using Vast.ai for video generation', { videoJobId: row.id } as any);
    
    // Send video prompts to Vast.ai
    const webhookUrl = `${env.CORS_ORIGIN || 'http://localhost:3000'}/api/v1/webhook/vast`;
    const vastResponse = await vastService.sendToVast(
        row.id,
        scriptData.duration,
        scriptData.videoPrompts,
        webhookUrl
    );

    // Update job with Vast.ai job ID
    await prisma.videoJob.update({
        where: { id: row.id },
        data: {
            progress: 30,
            vastJobId: vastResponse.vastJobId,
            result: {
                steps,
                generatedScript: scriptData.text,
                videoPrompts: scriptData.videoPrompts,
                vastJobId: vastResponse.vastJobId,
                status: 'sent_to_vast',
                message: vastResponse.message
            } as any
        }
    });

    logger.info('Video generation request sent to Vast.ai', {
        videoJobId: row.id,
        vastJobId: vastResponse.vastJobId,
        estimatedCompletionTime: vastResponse.estimatedCompletionTime
    } as any);

    // Job will be completed via webhook when Vast.ai finishes
    return;
}

// Fallback: Use original pipeline if Vast.ai is not configured
logger.info('Vast.ai not configured, using local pipeline', { videoJobId: row.id } as any);

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

