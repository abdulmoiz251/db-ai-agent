export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  output: string;
}

export type Role = "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ProviderResponse {
  content: string;
  toolCalls: ToolCall[];
  stopReason: "done" | "tool_use";
}

export interface ModelProvider {
  chat(history: Message[], tools: ToolDefinition[]): Promise<ProviderResponse>;
}
