import type { ModelProvider } from "./providers/types.js";
import type { Message, ToolResult } from "./providers/types.js";
import { toolDefinitions } from "./tools/definitions.js";
import { queryDb } from "./tools/queryDb.js";
import { sendEmail } from "./tools/sendEmail.js";

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  console.log(`\n  [tool] ${name}`, JSON.stringify(input, null, 2));

  switch (name) {
    case "query_db":
      return queryDb(input as unknown as Parameters<typeof queryDb>[0]);
    case "send_email":
      return sendEmail(input as unknown as Parameters<typeof sendEmail>[0]);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

export async function runAgent(prompt: string, provider: ModelProvider): Promise<void> {
  const history: Message[] = [
    { role: "user", content: prompt },
  ];

  console.log(`\nAgent running...\nPrompt: ${prompt}\n${"─".repeat(60)}`);

  while (true) {
    const response = await provider.chat(history, toolDefinitions);

    history.push({
      role: "assistant",
      content: response.content,
      toolCalls: response.toolCalls,
    });

    if (response.content) {
      console.log(`\nAssistant: ${response.content}`);
    }

    if (response.stopReason === "done" || response.toolCalls.length === 0) {
      break;
    }

    // Execute all tool calls in parallel
    const toolResults: ToolResult[] = await Promise.all(
      response.toolCalls.map(async (tc) => {
        const output = await executeTool(tc.name, tc.input);
        console.log(`\n  [result] ${tc.name}:`, output.slice(0, 300));
        return { id: tc.id, output };
      })
    );

    history.push({ role: "tool", content: "", toolResults });
  }

  console.log(`\n${"─".repeat(60)}\nDone.`);
}
