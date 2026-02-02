import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

let prismaInstance: PrismaClient | null = null;

export const getPrisma = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!prismaInstance) {
    const neon = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(neon);
    prismaInstance = new PrismaClient({ adapter });
  }

  return prismaInstance;
};
