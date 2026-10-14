import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDatabase = globalThis as typeof globalThis & { coolearnDatabase?: PrismaClient };

export function getDb(): PrismaClient {
  if (globalDatabase.coolearnDatabase) return globalDatabase.coolearnDatabase;
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(?:ql)?:\/\//.test(url)) {
    throw new Error("Configure DATABASE_URL with a PostgreSQL connection before using account features.");
  }
  const adapter = new PrismaPg({ connectionString: url, connectionTimeoutMillis: 5000 });
  const client = new PrismaClient({ adapter });
  globalDatabase.coolearnDatabase = client;
  return client;
}
