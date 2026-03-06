import type { ToolDefinition } from "../providers/types.js";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "query_db",
    description: `Run a MongoDB aggregation pipeline against the database.

Collections:

users — one document per user:
  { userId: string, name: string, email: string, createdAt: Date }

orders — one document per order, references users via userId:
  { orderId: string, userId: string, status: "completed"|"pending"|"refunded",
    items: [{ name, qty, price }], total: number, createdAt: Date }

IMPORTANT — date filtering:
createdAt is a native MongoDB Date. Use $expr with $$NOW for relative windows:
  { "$match": { "$expr": { "$gte": ["$createdAt", { "$subtract": ["$$NOW", 2592000000] }] } } }
2592000000 ms = 30 days. Adjust as needed.

IMPORTANT — joining users:
To get user details (name, email) with order aggregations, use $lookup after $group:
  { "$lookup": { "from": "users", "localField": "_id", "foreignField": "userId", "as": "user" } },
  { "$unwind": "$user" }
Then access "$user.name" and "$user.email".

Always return userId, name, email, and totalSpent in the final output.`,
    parameters: {
      type: "object",
      properties: {
        collection: {
          type: "string",
          description: "MongoDB collection name to query",
        },
        pipeline: {
          type: "array",
          description: "MongoDB aggregation pipeline stages as a JSON array",
          items: { type: "object" },
        },
      },
      required: ["collection", "pipeline"],
    },
  },
  {
    name: "send_email",
    description: "Send a discount code email to a single user.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        name: { type: "string", description: "Recipient's first name" },
        discountCode: { type: "string", description: "Discount code to include in the email" },
        discountPercent: {
          type: "number",
          description: "Discount percentage (e.g. 20 for 20% off)",
        },
      },
      required: ["to", "name", "discountCode", "discountPercent"],
    },
  },
];
