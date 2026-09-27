import OpenAI from 'openai';
import { AIProvider, ChatCompletionMessage, ChatCompletionOptions, ChatCompletionResult, EmbeddingResult } from './ai-provider.interface';
import { config } from '../config/env';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: config.openai.apiKey });
  }

  async complete(messages: ChatCompletionMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: options?.model || config.ai.model,
      messages,
      temperature: options?.temperature ?? config.ai.temperature,
      max_tokens: options?.maxTokens ?? config.ai.maxTokens
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return {
      embedding: response.data[0].embedding,
      usage: { totalTokens: response.usage.total_tokens }
    };
  }

  async streamComplete(
    messages: ChatCompletionMessage[],
    onToken: (token: string) => void,
    options?: ChatCompletionOptions
  ): Promise<void> {
    const stream = await this.client.chat.completions.create({
      model: options?.model || config.ai.model,
      messages,
      temperature: options?.temperature ?? config.ai.temperature,
      max_tokens: options?.maxTokens ?? config.ai.maxTokens,
      stream: true
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) onToken(token);
    }
  }
}
