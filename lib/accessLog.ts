import { prisma } from "@/lib/prisma";
import { attachUaField } from "@/lib/ua";

export async function logAccess(params: {
  userId?: string | null;
  path: string;
  method: string;
  status?: number;
  ip?: string | null;
  ua?: string | null;
}) {
  try {
    await prisma.accessLog.create({
      userId: params.userId ?? undefined,
      path: params.path,
      method: params.method,
      status: params.status ?? undefined,
      ip: params.ip ?? undefined,
      ...attachUaField({}, params.ua),
    });
  } catch {
    // best-effort
  }
}

