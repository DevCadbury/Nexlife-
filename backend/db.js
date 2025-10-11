import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env from .env, and fall back to nexlife.env if needed
dotenv.config();
if (!process.env.MONGODB_URI) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.join(__dirname, ".env") });
  if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(__dirname, "nexlife.env") });
  }
}

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || "nexlife";

let mongoClient;
let database;
let connectionStatus = "disconnected"; // disconnected | connecting | connected | error

export async function getDb() {
  if (database) return database;
  if (!mongoUri) throw new Error("Missing MONGODB_URI env");
  connectionStatus = "connecting";
  mongoClient = new MongoClient(mongoUri, { maxPoolSize: 10 });
  try {
    await mongoClient.connect();
    database = mongoClient.db(mongoDbName);
    await ensureIndexes(database);
    connectionStatus = "connected";
    // eslint-disable-next-line no-console
    console.log(`[DB] Connected to ${mongoDbName}`);
    return database;
  } catch (err) {
    connectionStatus = "error";
    // eslint-disable-next-line no-console
    console.error("[DB] Connection error:", err.message);
    throw err;
  }
}

export async function getCollections() {
  const db = await getDb();
  return {
    likes: db.collection("likes"),
    inquiries: db.collection("inquiries"),
    subscribers: db.collection("subscribers"),
    staff: db.collection("staff"),
    logs: db.collection("logs"),
    gallery: db.collection("gallery"),
    campaigns: db.collection("campaigns"),
    visitors: db.collection("visitors"),
  };
}

async function ensureIndexes(db) {
  await db.collection("likes").createIndex({ id: 1 }, { unique: true });
  await db
    .collection("inquiries")
    .createIndexes([
      { key: { email: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
    ]);
  await db
    .collection("subscribers")
    .createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { added_by: 1, is_locked: 1 } },
      { key: { deleted_by_admin: 1, deleted_by_super: 1 } },
      { key: { added_at: -1 } },
    ]);
  await db
    .collection("staff")
    .createIndexes([{ key: { email: 1 }, unique: true }, { key: { role: 1 } }]);
  await db
    .collection("logs")
    .createIndexes([
      { key: { createdAt: -1 } },
      { key: { level: 1, createdAt: -1 } },
      { key: { type: 1, createdAt: -1 } },
      { key: { category: 1, createdAt: -1 } },
      { key: { actorId: 1, createdAt: -1 } },
      { key: { customerId: 1, createdAt: -1 } },
    ]);
  await db
    .collection("gallery")
    .createIndexes([
      { key: { userEmail: 1, createdAt: -1 } },
      { key: { likes: -1 } },
    ]);
  await db
    .collection("campaigns")
    .createIndexes([{ key: { status: 1, createdAt: -1 } }]);
  await db
    .collection("visitors")
    .createIndexes([
      { key: { createdAt: -1 } },
      { key: { page: 1, createdAt: -1 } },
      { key: { country: 1, createdAt: -1 } },
      { key: { ip: 1, createdAt: -1 } },
    ]);
}

export async function addLog(entry) {
  const { logs } = await getCollections();
  const doc = {
    createdAt: new Date(),
    ...entry,
  };
  await logs.insertOne(doc);
  return doc;
}

export function getConnectionStatus() {
  return { status: connectionStatus, uri: Boolean(mongoUri), db: mongoDbName };
}

export default { getDb, getCollections, addLog, getConnectionStatus };
