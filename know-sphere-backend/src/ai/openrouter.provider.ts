import { AIProvider, ChatCompletionMessage, ChatCompletionOptions, ChatCompletionResult, EmbeddingResult } from './ai-provider.interface';
import { config } from '../config/env';

/**
 * OpenRouterProvider – uses OpenAI-compatible API at api.openrouter.ai.
 * Supports hundreds of models via a single API key.
 */
export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private baseUrl = 'https://openrouter.ai/api/v1';

  async complete(messages: ChatCompletionMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openrouter.apiKey}`,
        'HTTP-Referer': 'https://knowsphere.app',
        'X-Title': 'KnowSphere'
      },
      body: JSON.stringify({
        model: options?.model || 'anthropic/claude-3-haiku',
        messages,
        temperature: options?.temperature ?? config.ai.temperature,
        max_tokens: options?.maxTokens ?? config.ai.maxTokens
      })
    });
    const data = await res.json() as any;
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }

  async embed(_text: string): Promise<EmbeddingResult> {
    // OpenRouter does not provide embeddings – fallback to a warning
    console.warn('OpenRouter does not support embeddings. Use OpenAI or Gemini for embedding.');
    return { embedding: [] };
  }
}
