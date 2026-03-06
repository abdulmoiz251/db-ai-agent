import { getDb } from "../db/connection.js";

interface QueryDbInput {
  collection: string;
  pipeline: Record<string, unknown>[];
}

export async function queryDb(input: QueryDbInput): Promise<string> {
  try {
    const db = await getDb();
    const results = await db.collection(input.collection).aggregate(input.pipeline).toArray();
    return JSON.stringify(results, null, 2);
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}
