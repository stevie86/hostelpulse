// lib/db.ts
import { PrismaClient } from '@prisma/client';

const redactDatabaseUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '[invalid DATABASE_URL]';
  }
};

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  if (process.env.NODE_ENV !== 'production') {
    // Never print raw credentials.
    const safeUrl = url ? redactDatabaseUrl(url) : '(missing)';
    console.log(`[db] Initializing Prisma Client (DATABASE_URL=${safeUrl})`);
  }
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
