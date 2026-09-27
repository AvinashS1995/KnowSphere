import { AIProvider } from "./ai-provider.interface";
import { OpenAIProvider } from "./openai.provider";
import { GeminiProvider } from "./gemini.provider";
import { OpenRouterProvider } from "./openrouter.provider";
import { config } from "../config/env";

let instance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (instance) return instance;

  switch (config.ai.provider) {
    case "gemini":
      instance = new GeminiProvider();
      break;
    case "openrouter":
      instance = new OpenRouterProvider();
      break;
    case "openai":
      instance = new OpenRouterProvider();
      break;
    default:
      instance = new GeminiProvider();
  }

  console.log(`🤖 AI : ${config.ai.provider}`);
  console.log(`🤖 AI Provider: ${instance.name} (${config.ai.model})`);
  return instance;
}

/** Reset singleton (useful for tests or hot-reload) */
export function resetAIProvider(): void {
  instance = null;
}
