import { Db, MongoClient } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;


export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("Missing MONGODB_URI. Set USE_MOCK_DATA=false + provide Mongo envs to use MongoDB.");
  }
  if (!dbName) {
    throw new Error("Missing MONGODB_DB. Set USE_MOCK_DATA=false + provide Mongo envs to use MongoDB.");
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }

  return db;
}
