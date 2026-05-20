const { PrismaClient } = require("@prisma/client");

// Create a single Prisma instance reused across the whole app.
// In development, nodemon restarts create new instances — the global
// trick prevents running out of DB connections.

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn"], // logs every SQL query in dev
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
