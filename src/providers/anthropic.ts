import Anthropic from "@anthropic-ai/sdk";
import type {
  ModelProvider,
  Message,
  ToolDefinition,
  ProviderResponse,
  ToolCall,
} from "./types.js";

const MODEL = "claude-sonnet-4-6";

export class AnthropicProvider implements ModelProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(history: Message[], tools: ToolDefinition[]): Promise<ProviderResponse> {
    const messages: Anthropic.MessageParam[] = [];

    for (const msg of history) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
        continue;
      }

      if (msg.role === "assistant") {
        const content: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        for (const tc of msg.toolCalls ?? []) {
          content.push({
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: tc.input,
          });
        }
        messages.push({ role: "assistant", content });
        continue;
      }

      // tool results → single user message with tool_result blocks
      if (msg.role === "tool") {
        const content: Anthropic.ToolResultBlockParam[] = (msg.toolResults ?? []).map((tr) => ({
          type: "tool_result" as const,
          tool_use_id: tr.id,
          content: tr.output,
        }));
        messages.push({ role: "user", content });
      }
    }

    const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool["input_schema"],
    }));

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      tools: anthropicTools,
      messages,
    });

    const toolCalls: ToolCall[] = [];
    let textContent = "";

    for (const block of response.content) {
      if (block.type === "text") textContent += block.text;
      if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content: textContent,
      toolCalls,
      stopReason: response.stop_reason === "tool_use" ? "tool_use" : "done",
    };
  }
}
