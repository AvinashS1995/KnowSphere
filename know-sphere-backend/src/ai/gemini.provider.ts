import {
  AIProvider, ChatCompletionMessage, ChatCompletionOptions,
  ChatCompletionResult, EmbeddingResult
} from './ai-provider.interface';
import { config } from '../config/env';

/**
 * GeminiProvider – wraps the Google Generative AI REST API.
 * Supports: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.5-pro,
 *           gemini-2.0-flash, gemini-1.5-pro/flash (legacy)
 *
 * API key is read from config (process.env.GEMINI_API_KEY).
 * It is NEVER accepted from client requests.
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.gemini.apiKey;
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY is not set in .env — Gemini requests will fail');
    }
  }

  async complete(
    messages: ChatCompletionMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    if (!this.apiKey) throw new Error('AI provider is not configured. Set GEMINI_API_KEY in backend .env');

    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const contents = chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? config.ai.temperature,
        maxOutputTokens: options?.maxTokens ?? config.ai.maxTokens
      }
    };

    if (systemMsg) {
      body['systemInstruction'] = { parts: [{ text: systemMsg.content }] };
    }

    const model = options?.model ?? config.ai.model;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json() as any;
    const content: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { content };
  }

  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) throw new Error('AI provider is not configured. Set GEMINI_API_KEY in backend .env');

    const url = `${this.baseUrl}/models/text-embedding-004:embedContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini embed error ${res.status}: ${errText}`);
    }

    const data = await res.json() as any;
    return { embedding: data.embedding?.values ?? [] };
  }
}
