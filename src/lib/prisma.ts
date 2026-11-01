import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Prisma client factory.
 *
 * On Cloudflare Workers the database is reached through the Hyperdrive binding,
 * which provides a pooled connection string. Outside of Workers (local `next dev`
 * without a Hyperdrive binding) we fall back to DATABASE_URL from the environment.
 */
function resolveConnectionString(): string {
  try {
    const { env } = getCloudflareContext();
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      return hyperdrive.connectionString;
    }
  } catch {
    // Not running inside a Cloudflare context (e.g. plain Node build scripts).
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('No database connection available: HYPERDRIVE binding and DATABASE_URL are both missing');
  }
  return connectionString;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

// Cache the client per isolate. Hyperdrive pools the real connections, so a single
// client per isolate is the recommended pattern.
const globalForPrisma = globalThis as unknown as { __mardocsPrisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.__mardocsPrisma) {
    globalForPrisma.__mardocsPrisma = createPrismaClient();
  }
  return globalForPrisma.__mardocsPrisma;
}

/**
 * Lazy Prisma client.
 *
 * The connection is resolved on first property access instead of at module load,
 * because bindings are only available while handling a request.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
  has(_target, property) {
    return property in getClient();
  },
});
