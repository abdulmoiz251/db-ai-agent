import "dotenv/config";
import { getProvider } from "./providers/index.js";
import { runAgent } from "./agent.js";
import { closeDb } from "./db/connection.js";

const prompt = process.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.error('Usage: npm start "<your natural language prompt>"');
  console.error('Example: npm start "Find the top 3 users who spent the most last month and send them a discount code."');
  process.exit(1);
}

const provider = getProvider();
console.log(`Using provider: ${process.env.MODEL_PROVIDER ?? "claude"}`);

try {
  await runAgent(prompt, provider);
} finally {
  await closeDb();
}
