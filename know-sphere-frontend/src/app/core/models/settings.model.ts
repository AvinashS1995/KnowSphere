export type AIProvider = 'openai' | 'gemini' | 'openrouter';
export type VectorDBProvider = 'qdrant';

export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

export interface VectorDBSettings {
  provider: VectorDBProvider;
  url: string;
  collection: string;
  apiKey?: string;
}

export interface DocumentProcessingSettings {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  minRelevanceScore: number;
}

export interface SecuritySettings {
  sessionTimeout: number;
  mfaEnabled: boolean;
  allowedDomains: string[];
}

export interface NotificationSettings {
  emailNotifications: boolean;
  processingComplete: boolean;
  queryAlerts: boolean;
  weeklyReport: boolean;
}

export interface AppSettings {
  ai: AISettings;
  vectorDB: VectorDBSettings;
  documentProcessing: DocumentProcessingSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  appName: string;
  timezone: string;
  language: string;
}
