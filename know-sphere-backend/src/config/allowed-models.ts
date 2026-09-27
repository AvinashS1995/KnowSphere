/**
 * Server-side allowed model registry.
 * The frontend can only select models present in these lists.
 * API keys are read from process.env — NEVER from client requests.
 */

export const ALLOWED_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'o1-mini',
    'o3-mini',
    'gpt-3.5-turbo'   // legacy but still operational
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-pro',   // legacy
    'gemini-1.5-flash'  // legacy
  ],
  openrouter: [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'anthropic/claude-opus-4',
    'google/gemini-2.5-flash-preview',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct',
    'mistralai/mistral-7b-instruct:free',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-chat:free',
    'google/gemma-3-27b-it:free',
    'qwen/qwen3-235b-a22b:free',
    'openai/gpt-4o',
    'openai/gpt-4o-mini'
  ]
};

export function validateModel(provider: string, model: string): { valid: boolean; message: string } {
  const allowed = ALLOWED_MODELS[provider];
  if (!allowed) return { valid: false, message: `Unknown AI provider: ${provider}` };
  if (!allowed.includes(model)) return { valid: false, message: `Model '${model}' is not allowed for provider '${provider}'` };
  return { valid: true, message: 'ok' };
}

export const VALID_PROVIDERS = Object.keys(ALLOWED_MODELS);
