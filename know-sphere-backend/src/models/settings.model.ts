import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  workspaceId: string;
  ai: {
    provider: 'openai' | 'gemini' | 'openrouter';
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey?: string;
  };
  vectorDB: { provider: string; url: string; collection: string; apiKey?: string };
  documentProcessing: { chunkSize: number; chunkOverlap: number; topK: number; minRelevanceScore: number };
  security: { sessionTimeout: number; mfaEnabled: boolean; allowedDomains: string[] };
  notifications: { emailNotifications: boolean; processingComplete: boolean; queryAlerts: boolean; weeklyReport: boolean };
  appName: string;
  timezone: string;
  language: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  workspaceId: { type: String, default: 'default', unique: true },
  appName: { type: String, default: 'KnowSphere' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  language: { type: String, default: 'en' },
  ai: {
    provider: { type: String, enum: ['openai', 'gemini', 'openrouter'], default: 'openai' },
    model: { type: String, default: 'gpt-4o' },
    temperature: { type: Number, default: 0.2 },
    maxTokens: { type: Number, default: 2000 },
    apiKey: { type: String }
  },
  vectorDB: {
    provider: { type: String, default: 'qdrant' },
    url: { type: String, default: 'http://localhost:6333' },
    collection: { type: String, default: 'knowledge-base' },
    apiKey: { type: String }
  },
  documentProcessing: {
    chunkSize: { type: Number, default: 1000 },
    chunkOverlap: { type: Number, default: 150 },
    topK: { type: Number, default: 5 },
    minRelevanceScore: { type: Number, default: 0.7 }
  },
  security: {
    sessionTimeout: { type: Number, default: 30 },
    mfaEnabled: { type: Boolean, default: false },
    allowedDomains: [{ type: String }]
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    processingComplete: { type: Boolean, default: true },
    queryAlerts: { type: Boolean, default: false },
    weeklyReport: { type: Boolean, default: true }
  }
}, { timestamps: true });

export const SettingsModel = mongoose.model<ISettings>('Settings', settingsSchema);
