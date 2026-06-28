const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

// Use WebSockets (port 443/WSS) instead of TCP (port 5432).
// This bypasses ISP/firewall blocks on port 5432.
neonConfig.webSocketConstructor = ws;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  // Reuse across nodemon restarts; recreate if URL changed.
  if (!global.__prisma || global.__prismaUrl !== process.env.DATABASE_URL) {
    if (global.__prisma) global.__prisma.$disconnect().catch(() => {});
    global.__prisma = createPrismaClient();
    global.__prismaUrl = process.env.DATABASE_URL;
  }
  prisma = global.__prisma;
}

module.exports = prisma;
