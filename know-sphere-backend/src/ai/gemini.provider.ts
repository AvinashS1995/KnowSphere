import { AIProvider, ChatCompletionMessage, ChatCompletionOptions, ChatCompletionResult, EmbeddingResult } from './ai-provider.interface';
import { config } from '../config/env';

/**
 * GeminiProvider – wraps the Google Generative AI REST API.
 * Install @google/generative-ai when activating this provider.
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async complete(messages: ChatCompletionMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const contents = userMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = {
      contents,
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
      generationConfig: {
        temperature: options?.temperature ?? config.ai.temperature,
        maxOutputTokens: options?.maxTokens ?? config.ai.maxTokens
      }
    };

    const model = options?.model || 'gemini-1.5-pro';
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${config.gemini.apiKey}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json() as any;

    return { content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const url = `${this.baseUrl}/models/text-embedding-004:embedContent?key=${config.gemini.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'models/text-embedding-004', content: { parts: [{ text }] } })
    });
    const data = await res.json() as any;
    return { embedding: data.embedding?.values || [] };
  }
}
