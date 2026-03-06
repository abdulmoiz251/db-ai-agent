# db-ai-agent

An AI agent that takes a natural language command from the terminal, queries MongoDB, and sends emails — all autonomously via tool calling.

```bash
npm start "Find the top 3 users who spent the most last month and send them a discount code."
```

The agent figures out the MongoDB query, fetches the data, generates discount codes, and sends emails — no hardcoded logic.

---

## How It Works

```
Your prompt → AI Agent → query_db tool → MongoDB
                      → send_email tool → SMTP
```

The agent uses an agentic loop: it calls tools, gets results back, then decides what to do next — until the task is complete.

---

## Requirements

- Node.js 18+
- MongoDB (local or remote)
- API key for Claude or Groq/OpenAI

---

## Setup

**1. Clone and install**

```bash
git clone https://github.com/abdulmoiz251/db-ai-agent.git
cd db-ai-agent
npm install
```

**2. Configure `.env`**

Copy the example and fill in your values:

```bash
cp .env.example .env
```


**3. Seed the database**

```bash
npm run seed
```

This creates `users` and `orders` collections with sample data.

**4. Run**

```bash
npm start "Find the top 3 users who spent the most last month and send them a discount code."
```

---

## Project Structure

```
src/
├── index.ts              # CLI entrypoint
├── agent.ts              # Agentic loop
├── providers/
│   ├── types.ts          # Shared interfaces
│   ├── anthropic.ts      # Claude adapter
│   ├── openai.ts         # OpenAI-compatible adapter
│   └── index.ts          # Provider factory
├── tools/
│   ├── definitions.ts    # Tool schemas
│   ├── queryDb.ts        # MongoDB executor
│   └── sendEmail.ts      # Email sender
└── db/
    └── connection.ts     # MongoDB client
seed.ts                   # Sample data
```
