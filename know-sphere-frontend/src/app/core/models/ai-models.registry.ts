/**
 * KnowSphere – AI Models Registry
 *
 * Sources (verified as of 2026):
 *  OpenAI   → platform.openai.com/docs/models
 *  Gemini   → ai.google.dev/gemini-api/docs/models/gemini
 *  OpenRouter → openrouter.ai/models
 *
 * RULES:
 *  - No API keys here. Zero secrets.
 *  - null  = provider has not publicly documented the limit.
 *  - Deprecated / legacy models are marked but NOT removed (for display in history).
 *  - Free-tier limits are from official provider docs; do NOT extrapolate daily → monthly.
 */

import { AIProvider, ModelOption } from './settings.model';

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI MODELS
// Pricing source: platform.openai.com/pricing  (per 1M tokens, USD)
// Rate limits vary by usage tier; values below are Tier 1 defaults.
// OpenAI has NO free API tier.
// ─────────────────────────────────────────────────────────────────────────────
const OPENAI_MODELS: ModelOption[] = [
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    free: false,
    tier: 'premium',
    status: 'active',
    recommended: true,
    description: 'Most capable multimodal model. Best quality for enterprise RAG.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    requestsPerMinute: 500,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 30000,
    outputTokensPerMinute: null,
    inputPricePer1M: 2.5,
    outputPricePer1M: 10.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: [
      'Enterprise RAG',
      'Knowledge Copilot',
      'Document Q&A',
      'Multimodal',
      'Reasoning',
    ],
  },
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    free: false,
    tier: 'budget',
    status: 'active',
    recommended: true,
    description: 'Fast and cost-effective. Ideal for high-volume RAG with good accuracy.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    requestsPerMinute: 500,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 200000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: ['High-volume', 'Chatbot', 'RAG', 'Summarization', 'Classification'],
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    free: false,
    tier: 'premium',
    status: 'active',
    description: 'Previous generation flagship model. 128K context window.',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    requestsPerMinute: 500,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 30000,
    outputTokensPerMinute: null,
    inputPricePer1M: 10.0,
    outputPricePer1M: 30.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: ['Enterprise RAG', 'Long-context', 'Reasoning'],
  },
  {
    value: 'o1-mini',
    label: 'o1-mini',
    free: false,
    tier: 'standard',
    status: 'active',
    description:
      'Reasoning model optimised for STEM and complex analysis. Slower but more thorough.',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 10000,
    outputTokensPerMinute: null,
    inputPricePer1M: 1.1,
    outputPricePer1M: 4.4,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: ['Reasoning', 'Coding', 'Document Q&A'],
  },
  {
    value: 'o3-mini',
    label: 'o3-mini',
    free: false,
    tier: 'premium',
    status: 'active',
    description: 'Latest reasoning model. Excellent for multi-step document reasoning tasks.',
    contextWindow: 200000,
    maxOutputTokens: 100000,
    requestsPerMinute: 50,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 10000,
    outputTokensPerMinute: null,
    inputPricePer1M: 1.1,
    outputPricePer1M: 4.4,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: ['Reasoning', 'Enterprise RAG', 'Long-context'],
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    free: false,
    tier: 'budget',
    status: 'legacy',
    description: 'Older, fast and very cheap model. Superseded by GPT-4o Mini.',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    requestsPerMinute: 3500,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 90000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.5,
    outputPricePer1M: 1.5,
    credit: null,
    creditUnit: 'USD',
    reset: 'minute',
    recommendedFor: ['Prototype', 'Testing', 'High-volume'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI MODELS
// Source: ai.google.dev/gemini-api/docs/models/gemini
// Free tier limits verified from Google AI Studio / Gemini API docs.
// Free quota resets daily at 00:00 PT.
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_MODELS: ModelOption[] = [
  {
    value: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    free: true,
    tier: 'free',
    status: 'active',
    recommended: true,
    description:
      'Google flagship Flash model for enterprise RAG, complex reasoning and agentic workflows.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    // Google does not publish one universal fixed quota here.
    // Actual limits depend on project / usage tier.
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: [
      'Enterprise RAG',
      'Knowledge Copilot',
      'Document Q&A',
      'Complex Reasoning',
      'Agentic Workflows',
      'Coding',
      'Long-context',
    ],
  },
  {
    value: 'gemini-3.7-flash',
    label: 'Gemini 3.7 Flash',
    free: true,
    tier: 'free',
    status: 'active',
    recommended: false,
    description:
      'Previous-generation Flash model for coding, agentic workflows and reliable multi-step execution.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['RAG', 'Coding', 'Document Q&A', 'Agentic Workflows', 'Chatbot'],
  },
  {
    value: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    free: true,
    tier: 'free',
    status: 'active',
    recommended: false,
    description: 'Best free model for RAG. Fast adaptive thinking with 1M context window.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    requestsPerMinute: 10,
    requestsPerDay: 250,
    requestsPerMonth: null,
    inputTokensPerMinute: 250000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.0,
    outputPricePer1M: 0.0, // Free tier
    credit: 0,
    creditUnit: 'USD',
    reset: 'daily',
    resetTime: '00:00 PT',
    recommendedFor: [
      'Enterprise RAG',
      'Knowledge Copilot',
      'Document Q&A',
      'Long-context',
      'Prototype',
    ],
  },
  {
    value: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash-Lite',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Lighter, faster version of 2.5 Flash. Higher RPM on free tier.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    requestsPerMinute: 30,
    requestsPerDay: 1500,
    requestsPerMonth: null,
    inputTokensPerMinute: 1000000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.0,
    outputPricePer1M: 0.0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'daily',
    resetTime: '00:00 PT',
    recommendedFor: ['High-volume', 'Chatbot', 'Summarization', 'Classification'],
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    free: false,
    tier: 'premium',
    status: 'active',
    description: 'Most capable Gemini model. Paid only. Best for complex enterprise tasks.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    requestsPerMinute: 150,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: 2000000,
    outputTokensPerMinute: null,
    inputPricePer1M: 1.25,
    outputPricePer1M: 10.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Enterprise RAG', 'Reasoning', 'Long-context', 'Multimodal'],
  },
  {
    value: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Previous generation Flash. Stable, well-tested, free tier available.',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    requestsPerMonth: null,
    inputTokensPerMinute: 1000000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.0,
    outputPricePer1M: 0.0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'daily',
    resetTime: '00:00 PT',
    recommendedFor: ['Document Q&A', 'Chatbot', 'Summarization'],
  },
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    free: false,
    tier: 'standard',
    status: 'legacy',
    description: 'Legacy 1.5 series. Use Gemini 2.5 Pro instead.',
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    requestsPerMinute: 1,
    requestsPerDay: 50,
    requestsPerMonth: null,
    inputTokensPerMinute: 32000,
    outputTokensPerMinute: null,
    inputPricePer1M: 1.25,
    outputPricePer1M: 5.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'daily',
    recommendedFor: ['Long-context'],
  },
  {
    value: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    free: true,
    tier: 'free',
    status: 'legacy',
    description: 'Legacy 1.5 series Flash. Use Gemini 2.5 Flash instead.',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    requestsPerMonth: null,
    inputTokensPerMinute: 1000000,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.0,
    outputPricePer1M: 0.0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'daily',
    resetTime: '00:00 PT',
    recommendedFor: ['Prototype'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OPENROUTER MODELS
// Source: openrouter.ai/models
// Free models use ":free" suffix; limits are per model as documented.
// Free plan: provider-level limits apply. Paid plans remove limits.
// Model IDs are exact OpenRouter model IDs.
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER_MODELS: ModelOption[] = [
  // ── Anthropic Claude ───────────────────────────────────────────────────────
  {
    value: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    free: false,
    tier: 'premium',
    status: 'active',
    recommended: true,
    description: 'Best Claude model for complex reasoning and enterprise RAG.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 3.0,
    outputPricePer1M: 15.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: [
      'Enterprise RAG',
      'Knowledge Copilot',
      'Reasoning',
      'Document Q&A',
      'Long-context',
    ],
  },
  {
    value: 'anthropic/claude-3.5-haiku',
    label: 'Claude 3.5 Haiku',
    free: false,
    tier: 'budget',
    status: 'active',
    description: 'Fastest Claude model. Great for high-volume chatbot and summarisation.',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.8,
    outputPricePer1M: 4.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['High-volume', 'Chatbot', 'Summarization', 'Classification'],
  },
  {
    value: 'anthropic/claude-opus-4',
    label: 'Claude Opus 4',
    free: false,
    tier: 'premium',
    status: 'active',
    description: 'Anthropic flagship – highest intelligence. Ideal for complex document analysis.',
    contextWindow: 200000,
    maxOutputTokens: 32000,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 15.0,
    outputPricePer1M: 75.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Enterprise RAG', 'Reasoning', 'Long-context', 'Document Q&A'],
  },
  // ── Google via OpenRouter ──────────────────────────────────────────────────
  {
    value: 'google/gemini-2.5-flash-preview',
    label: 'Gemini 2.5 Flash (via OR)',
    free: false,
    tier: 'budget',
    status: 'active',
    description: 'Gemini 2.5 Flash routed via OpenRouter. Single-key multi-provider access.',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Long-context', 'Document Q&A', 'Multimodal'],
  },
  // ── Meta Llama ────────────────────────────────────────────────────────────
  {
    value: 'meta-llama/llama-3.3-70b-instruct',
    label: 'LLaMA 3.3 70B Instruct',
    free: false,
    tier: 'standard',
    status: 'active',
    description: 'Meta open-weight model. Excellent for enterprise tasks at low cost.',
    contextWindow: 131072,
    maxOutputTokens: 32768,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.09,
    outputPricePer1M: 0.29,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['RAG', 'Document Q&A', 'High-volume', 'Summarization'],
  },
  {
    value: 'meta-llama/llama-3.1-8b-instruct:free',
    label: 'LLaMA 3.1 8B (Free)',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Free Meta model via OpenRouter. Good for testing and low-stakes RAG.',
    contextWindow: 131072,
    maxOutputTokens: 4096,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null, // OR free plan limits
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Prototype', 'Testing', 'Chatbot'],
  },
  // ── Mistral ───────────────────────────────────────────────────────────────
  {
    value: 'mistralai/mistral-small-3.1-24b-instruct',
    label: 'Mistral Small 3.1 24B',
    free: false,
    tier: 'budget',
    status: 'active',
    description: 'Efficient Mistral model. Great for RAG with strong multilingual support.',
    contextWindow: 131072,
    maxOutputTokens: 32768,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.1,
    outputPricePer1M: 0.3,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['RAG', 'Summarization', 'High-volume'],
  },
  {
    value: 'mistralai/mistral-7b-instruct:free',
    label: 'Mistral 7B (Free)',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Free Mistral model via OpenRouter. Reliable baseline for testing RAG.',
    contextWindow: 32768,
    maxOutputTokens: 4096,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Prototype', 'Testing'],
  },
  // ── DeepSeek ──────────────────────────────────────────────────────────────
  {
    value: 'deepseek/deepseek-r1',
    label: 'DeepSeek R1',
    free: false,
    tier: 'budget',
    status: 'active',
    description: 'Strong open-source reasoning model. Excellent value for enterprise RAG.',
    contextWindow: 65536,
    maxOutputTokens: 32768,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.55,
    outputPricePer1M: 2.19,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Reasoning', 'RAG', 'Document Q&A', 'Coding'],
  },
  {
    value: 'deepseek/deepseek-chat:free',
    label: 'DeepSeek Chat (Free)',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Free DeepSeek conversational model. Good multilingual support.',
    contextWindow: 65536,
    maxOutputTokens: 4096,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Prototype', 'Chatbot', 'Testing'],
  },
  // ── Google Gemma (free) ───────────────────────────────────────────────────
  {
    value: 'google/gemma-3-27b-it:free',
    label: 'Gemma 3 27B (Free)',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Google open model. Free via OpenRouter. Multimodal capable.',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Prototype', 'Multimodal', 'Testing'],
  },
  // ── Qwen (free) ───────────────────────────────────────────────────────────
  {
    value: 'qwen/qwen3-235b-a22b:free',
    label: 'Qwen3 235B (Free)',
    free: true,
    tier: 'free',
    status: 'active',
    description: 'Alibaba large open model. Hybrid thinking. Free via OpenRouter.',
    contextWindow: 40960,
    maxOutputTokens: 16000,
    requestsPerMinute: 20,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    credit: 0,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Prototype', 'Reasoning', 'Testing'],
  },
  // ── OpenAI via OpenRouter ─────────────────────────────────────────────────
  {
    value: 'openai/gpt-4o',
    label: 'GPT-4o (via OpenRouter)',
    free: false,
    tier: 'premium',
    status: 'active',
    description: 'Access OpenAI GPT-4o through OpenRouter with a single API key.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 2.5,
    outputPricePer1M: 10.0,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['Enterprise RAG', 'Knowledge Copilot'],
  },
  {
    value: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini (via OpenRouter)',
    free: false,
    tier: 'budget',
    status: 'active',
    description: 'OpenAI GPT-4o Mini via OpenRouter. Cost-efficient RAG.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    requestsPerMinute: null,
    requestsPerDay: null,
    requestsPerMonth: null,
    inputTokensPerMinute: null,
    outputTokensPerMinute: null,
    inputPricePer1M: 0.15,
    outputPricePer1M: 0.6,
    credit: null,
    creditUnit: 'USD',
    reset: 'provider-managed',
    recommendedFor: ['RAG', 'High-volume', 'Chatbot'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main registry
// ─────────────────────────────────────────────────────────────────────────────
export const AI_MODELS: Record<AIProvider, ModelOption[]> = {
  openai: OPENAI_MODELS,
  gemini: GEMINI_MODELS,
  openrouter: OPENROUTER_MODELS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider metadata (for UI cards)
// ─────────────────────────────────────────────────────────────────────────────
export const AI_PROVIDERS_META: Record<
  AIProvider,
  {
    label: string;
    emoji: string;
    hasFree: boolean;
    description: string;
    website: string;
    docsUrl: string;
  }
> = {
  openai: {
    label: 'OpenAI',
    emoji: '🤖',
    hasFree: false,
    description: 'GPT-4o, o3-mini, GPT-4 Turbo — industry standard',
    website: 'openai.com',
    docsUrl: 'platform.openai.com/docs/models',
  },
  gemini: {
    label: 'Gemini',
    emoji: '✨',
    hasFree: true,
    description: 'Gemini 2.5 Flash/Pro — 1M context, free tier available',
    website: 'ai.google.dev',
    docsUrl: 'ai.google.dev/gemini-api/docs/models',
  },
  openrouter: {
    label: 'OpenRouter',
    emoji: '🔀',
    hasFree: true,
    description: '200+ models via one key — Claude, Llama, Mistral, DeepSeek & more',
    website: 'openrouter.ai',
    docsUrl: 'openrouter.ai/models',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** All active models for a provider */
export function getActiveModels(provider: AIProvider): ModelOption[] {
  return AI_MODELS[provider].filter((m) => m.status === 'active');
}

/** Free models only */
export function getFreeModels(provider: AIProvider): ModelOption[] {
  return getActiveModels(provider).filter((m) => m.free);
}

/** Paid models only */
export function getPaidModels(provider: AIProvider): ModelOption[] {
  return getActiveModels(provider).filter((m) => !m.free);
}

/** Recommended models */
export function getRecommendedModels(provider: AIProvider): ModelOption[] {
  return getActiveModels(provider).filter((m) => m.recommended);
}

/** Find a model by its API value */
export function getModelByValue(provider: AIProvider, value: string): ModelOption | undefined {
  return AI_MODELS[provider].find((m) => m.value === value);
}

/** Get rate limit summary for display */
export function getModelLimits(model: ModelOption): string {
  const parts: string[] = [];
  if (model.requestsPerMinute) parts.push(`${model.requestsPerMinute} RPM`);
  if (model.requestsPerDay) parts.push(`${model.requestsPerDay} RPD`);
  if (model.inputTokensPerMinute)
    parts.push(`${(model.inputTokensPerMinute / 1000).toFixed(0)}K TPM`);
  return parts.length ? parts.join(' · ') : 'Provider-managed';
}

/** Format context window for display */
export function formatContext(tokens: number | null): string {
  if (!tokens) return '—';
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return String(tokens);
}

/** Format price for display */
export function formatPrice(price: number | null): string {
  if (price === null) return '—';
  if (price === 0) return '$0';
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(2)}`;
}

/** Server-side allowed model values (mirrors backend ALLOWED_MODELS) */
export const ALLOWED_MODEL_VALUES: Record<AIProvider, string[]> = {
  openai: OPENAI_MODELS.filter((m) => m.status === 'active').map((m) => m.value),
  gemini: GEMINI_MODELS.filter((m) => m.status === 'active').map((m) => m.value),
  openrouter: OPENROUTER_MODELS.filter((m) => m.status === 'active').map((m) => m.value),
};
