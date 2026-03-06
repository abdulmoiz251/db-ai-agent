import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in .env");
    client = new MongoClient(uri);
    await client.connect();
  }
  const dbName = process.env.MONGODB_DB ?? "shop";
  return client.db(dbName);
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
