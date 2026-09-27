export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface EmbeddingResult {
  embedding: number[];
  usage?: { totalTokens: number };
}

export interface AIProvider {
  name: string;
  complete(messages: ChatCompletionMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResult>;
  embed(text: string): Promise<EmbeddingResult>;
  streamComplete?(
    messages: ChatCompletionMessage[],
    onToken: (token: string) => void,
    options?: ChatCompletionOptions
  ): Promise<void>;
}
