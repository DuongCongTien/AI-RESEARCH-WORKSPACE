import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbAvailable: boolean | undefined;
  lastDbCheck: number | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Checks if the PostgreSQL TCP port is open before attempting any Prisma calls.
 * This prevents Prisma's native engine from writing connection errors to stderr.
 */
function isTcpPortReachable(): Promise<boolean> {
  return new Promise((resolve) => {
    let host = '127.0.0.1';
    let port = 5432;

    try {
      const urlStr = process.env.DATABASE_URL;
      if (urlStr) {
        const parsed = new URL(urlStr.replace('postgresql://', 'http://'));
        host = parsed.hostname || '127.0.0.1';
        port = parsed.port ? parseInt(parsed.port, 10) : 5432;
      }
    } catch {
      // fallback to localhost:5432
    }

    const socket = new net.Socket();
    socket.setTimeout(300);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/**
 * Check if the PostgreSQL database is reachable without blocking on long timeouts.
 * Caches the result for 15 seconds to avoid repeatedly checking and delaying responses.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (
    globalForPrisma.lastDbCheck &&
    now - globalForPrisma.lastDbCheck < 15000 &&
    globalForPrisma.dbAvailable !== undefined
  ) {
    return globalForPrisma.dbAvailable;
  }

  globalForPrisma.lastDbCheck = now;

  // Step 1: Pre-flight TCP check to avoid Prisma console spam when port 5432 is closed
  const portOpen = await isTcpPortReachable();
  if (!portOpen) {
    globalForPrisma.dbAvailable = false;
    return false;
  }

  // Step 2: Query ping only if port is actually listening
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 800)),
    ]);
    globalForPrisma.dbAvailable = true;
    return true;
  } catch {
    globalForPrisma.dbAvailable = false;
    return false;
  }
}

export default prisma;
