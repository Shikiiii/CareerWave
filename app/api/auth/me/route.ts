import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { getCurrentAuthUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return apiError("Unauthorized.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profile: true,
      employer: {
        include: {
          companyProfile: true,
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return apiError("Unauthorized.", 401);
  }

  return apiOk({ user });
}
