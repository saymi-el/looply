export interface VideoRequest {
  platform?: string;
  tone?: string;
  script?: string;
  duration?: number;
  visualStyle?: string;
  useModularGeneration?: boolean;
  context?: any;
}