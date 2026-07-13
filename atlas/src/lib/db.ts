import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

// SQLite file lives at the project root (where `prisma migrate` puts it,
// per DATABASE_URL="file:./dev.db" resolved from the project root).
const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: dbUrl.startsWith("file:./")
      ? `file:${path.join(process.cwd(), dbUrl.slice("file:./".length))}`
      : dbUrl,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
