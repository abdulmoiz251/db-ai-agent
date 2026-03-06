import OpenAI from "openai";
import type {
  ModelProvider,
  Message,
  ToolDefinition,
  ProviderResponse,
  ToolCall,
} from "./types.js";

export class OpenAIProvider implements ModelProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL?: string, model?: string) {
    this.client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
    this.model = model ?? "gpt-4o";
  }

  async chat(history: Message[], tools: ToolDefinition[]): Promise<ProviderResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    for (const msg of history) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
        continue;
      }

      if (msg.role === "assistant") {
        const toolCalls = (msg.toolCalls ?? []).map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.input) },
        }));
        messages.push({
          role: "assistant",
          content: msg.content || null,
          ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
        });
        continue;
      }

      // tool results → one "tool" message per result
      if (msg.role === "tool") {
        for (const tr of msg.toolResults ?? []) {
          messages.push({ role: "tool", tool_call_id: tr.id, content: tr.output });
        }
      }
    }

    const openaiTools: OpenAI.Chat.ChatCompletionTool[] = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      tools: openaiTools,
      messages,
    });

    const choice = response.choices[0];
    const toolCalls: ToolCall[] = (choice.message.tool_calls ?? []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments) as Record<string, unknown>,
    }));

    return {
      content: choice.message.content ?? "",
      toolCalls,
      stopReason: choice.finish_reason === "tool_calls" ? "tool_use" : "done",
    };
  }
}
