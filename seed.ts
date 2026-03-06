import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { randomUUID } from "crypto";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "shop";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── Users ──────────────────────────────────────────────────────────────────
const users = [
  { _id: new ObjectId(), userId: "u1", name: "Alice Johnson", email: "alice@example.com", createdAt: daysAgo(120) },
  { _id: new ObjectId(), userId: "u2", name: "Bob Smith",     email: "bob@example.com",   createdAt: daysAgo(200) },
  { _id: new ObjectId(), userId: "u3", name: "Carol White",   email: "carol@example.com", createdAt: daysAgo(90)  },
  { _id: new ObjectId(), userId: "u4", name: "Dave Brown",    email: "dave@example.com",  createdAt: daysAgo(60)  },
  { _id: new ObjectId(), userId: "u5", name: "Eve Davis",     email: "eve@example.com",   createdAt: daysAgo(300) },
];

// ── Orders ─────────────────────────────────────────────────────────────────
// status: "completed" | "pending" | "refunded"
// total = sum of items[].price * items[].qty
const orders = [
  // Alice — $595 this month (top)
  {
    orderId: randomUUID(), userId: "u1", status: "completed", createdAt: daysAgo(5),
    items: [{ name: "Wireless Headphones", qty: 1, price: 199 }, { name: "Phone Case", qty: 2, price: 19 }, { name: "USB-C Hub", qty: 1, price: 83 }],
    total: 320,
  },
  {
    orderId: randomUUID(), userId: "u1", status: "completed", createdAt: daysAgo(12),
    items: [{ name: "Mechanical Keyboard", qty: 1, price: 180 }],
    total: 180,
  },
  {
    orderId: randomUUID(), userId: "u1", status: "completed", createdAt: daysAgo(20),
    items: [{ name: "Mouse Pad XL", qty: 1, price: 45 }, { name: "Cable Organiser", qty: 2, price: 25 }],
    total: 95,
  },

  // Bob — $510 this month (second)
  {
    orderId: randomUUID(), userId: "u2", status: "completed", createdAt: daysAgo(3),
    items: [{ name: "4K Monitor", qty: 1, price: 399 }, { name: "HDMI Cable", qty: 2, price: 15 }, { name: "Monitor Arm", qty: 1, price: 21 }],
    total: 450,
  },
  {
    orderId: randomUUID(), userId: "u2", status: "completed", createdAt: daysAgo(18),
    items: [{ name: "Webcam", qty: 1, price: 60 }],
    total: 60,
  },

  // Carol — $350 this month (third)
  {
    orderId: randomUUID(), userId: "u3", status: "completed", createdAt: daysAgo(8),
    items: [{ name: "Standing Desk Mat", qty: 1, price: 89 }, { name: "Desk Lamp", qty: 1, price: 121 }],
    total: 210,
  },
  {
    orderId: randomUUID(), userId: "u3", status: "completed", createdAt: daysAgo(25),
    items: [{ name: "Notebook Set", qty: 3, price: 18 }, { name: "Pen Holder", qty: 1, price: 86 }],
    total: 140,
  },

  // Dave — $99 this month (fourth)
  {
    orderId: randomUUID(), userId: "u4", status: "pending", createdAt: daysAgo(10),
    items: [{ name: "Screen Cleaner Kit", qty: 1, price: 99 }],
    total: 99,
  },

  // Eve — $55 this month (fifth)
  {
    orderId: randomUUID(), userId: "u5", status: "completed", createdAt: daysAgo(7),
    items: [{ name: "Sticker Pack", qty: 5, price: 11 }],
    total: 55,
  },

  // Old orders — 45–60 days ago, must be excluded from "last month" queries
  {
    orderId: randomUUID(), userId: "u4", status: "completed", createdAt: daysAgo(45),
    items: [{ name: "Old Monitor", qty: 1, price: 9999 }],
    total: 9999,
  },
  {
    orderId: randomUUID(), userId: "u5", status: "completed", createdAt: daysAgo(60),
    items: [{ name: "Old Laptop", qty: 1, price: 9999 }],
    total: 9999,
  },
];

// ── Insert ──────────────────────────────────────────────────────────────────
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

await db.collection("users").drop().catch(() => null);
await db.collection("orders").drop().catch(() => null);

await db.collection("users").insertMany(users);
await db.collection("orders").insertMany(orders);

// Indexes
await db.collection("users").createIndex({ userId: 1 }, { unique: true });
await db.collection("orders").createIndex({ userId: 1 });
await db.collection("orders").createIndex({ createdAt: -1 });

console.log(`✓ users   — ${users.length} documents`);
console.log(`✓ orders  — ${orders.length} documents`);
console.log(`\nExpected top 3 (last 30 days):`);
console.log(`  1. Alice Johnson  $595`);
console.log(`  2. Bob Smith      $510`);
console.log(`  3. Carol White    $350`);

await client.close();
