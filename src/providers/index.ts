import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";
import type { ModelProvider } from "./types.js";

export function getProvider(): ModelProvider {
  const provider = (process.env.MODEL_PROVIDER ?? "claude").toLowerCase();

  if (provider === "claude") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set in .env");
    return new AnthropicProvider(key);
  }

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set in .env");
    const baseURL = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL;
    return new OpenAIProvider(key, baseURL, model);
  }

  throw new Error(`Unknown MODEL_PROVIDER "${provider}". Use "claude" or "openai".`);
}

export type { ModelProvider };
