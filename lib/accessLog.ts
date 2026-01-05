import { prisma } from "@/lib/prisma";

export async function logAccess(params: {
  userId?: string | null;
  path: string;
  method: string;
  status?: number;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.accessLog.create({
      data: {
        userId: params.userId ?? null,
        path: params.path,
        method: params.method,
        status: params.status ?? null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch {
    // best-effort
  }
}
