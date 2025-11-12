import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Lazy initialization - only create Prisma client when needed
function getPrismaClient(): PrismaClient {
  if (global.prisma) {
    return global.prisma;
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please set it in your environment variables.');
  }
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  global.prisma = client;
  return client;
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export * from '@prisma/client';

