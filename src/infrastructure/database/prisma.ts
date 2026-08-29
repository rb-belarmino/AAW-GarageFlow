import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  // Configure WebSocket for Node.js environment (Next.js server)
  if (typeof window === "undefined") {
    neonConfig.webSocketConstructor = ws;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_IxE8n1cBikZJ@ep-flat-salad-aveb0yu6-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
