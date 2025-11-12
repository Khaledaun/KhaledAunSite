const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  try {
    await db.$connect();
    console.log("connected");
  } catch (e) {
    console.error("error", e);
  } finally {
    await db.$disconnect().catch(() => {});
  }
})();
