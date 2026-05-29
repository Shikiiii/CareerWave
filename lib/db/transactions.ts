import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TransactionClient = Prisma.TransactionClient;

export async function runInTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>,
  client: PrismaClient = prisma,
) {
  return client.$transaction(callback);
}
