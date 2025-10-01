/**
 * Types for Vast.ai video generation integration
 */

export interface VideoPrompt {
  scene: string;
  positive: string;
  negative: string;
  timing?: {
    start: number;
    end: number;
  };
  timeRange?: string;
}

export interface VastRequest {
  videoJobId: string;
  duration: number;
  videoPrompts: VideoPrompt[];
  webhookUrl?: string;
}

export interface VastResponse {
  success: boolean;
  vastJobId: string;
  message: string;
  estimatedCompletionTime?: number;
}

export interface VastWebhookPayload {
  vastJobId: string;
  videoJobId: string;
  status: 'completed' | 'failed' | 'processing';
  videoUrl?: string;
  cloudProvider?: string;
  error?: string;
  metadata?: {
    duration: number;
    fileSize: number;
    resolution: string;
    format: string;
  };
}

export interface VastConfig {
  apiUrl: string;
  apiKey?: string;
  webhookSecret?: string;
  timeout?: number;
}
