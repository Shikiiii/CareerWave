import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification({ userId, type, title, message, metadata }: NotificationInput) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: metadata ?? undefined,
    },
  });
}

export async function safelyCreateNotification(input: NotificationInput) {
  try {
    return await createNotification(input);
  } catch {
    return null;
  }
}
