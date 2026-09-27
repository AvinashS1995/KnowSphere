// ─────────────────────────────────────────────────────────────────────────────
// Settings Model – KnowSphere
// IMPORTANT: API keys are NEVER stored here. They live only in backend .env
// ─────────────────────────────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'gemini' | 'openrouter';
export type VectorDBProvider = 'qdrant';
export type ModelStatus = 'active' | 'legacy' | 'deprecated' | 'preview';
export type ModelTier = 'free' | 'budget' | 'standard' | 'premium';
export type CreditUnit = 'USD' | 'tokens' | 'requests' | null;
export type ResetPeriod = 'minute' | 'daily' | 'monthly' | 'none' | 'provider-managed';

/** Rich metadata for every AI model – safe to send to the frontend (no secrets) */
export interface ModelOption {
  value: string;             // API model ID (e.g. "gpt-4o", "gemini-2.5-flash")
  label: string;             // Human-readable name
  free: boolean;             // Has a genuine free tier?
  description: string;       // One-line description
  tier: ModelTier;           // 'free' | 'budget' | 'standard' | 'premium'
  status: ModelStatus;       // 'active' | 'legacy' | 'deprecated' | 'preview'
  recommended?: boolean;     // Show ⭐ badge

  // Context & output
  contextWindow: number | null;
  maxOutputTokens: number | null;

  // Rate limits (null = not publicly documented)
  requestsPerMinute: number | null;
  requestsPerDay: number | null;
  requestsPerMonth: number | null;
  inputTokensPerMinute: number | null;
  outputTokensPerMinute: number | null;

  // Pricing (USD per 1M tokens; null = free or not applicable)
  inputPricePer1M: number | null;
  outputPricePer1M: number | null;

  // Credits / free quota
  credit: number | null;
  creditUnit: CreditUnit;
  reset: ResetPeriod;
  resetTime?: string | null;  // e.g. "00:00 PT" if provider specifies

  // Use-case tags
  recommendedFor: string[];
}

// ─── AISettings: NO apiKey field ─────────────────────────────────────────────
export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  // apiKey is intentionally absent — lives only in backend .env
}

export interface VectorDBSettings {
  provider: VectorDBProvider;
  url: string;
  collection: string;
  // Qdrant API key stays backend-only too
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
