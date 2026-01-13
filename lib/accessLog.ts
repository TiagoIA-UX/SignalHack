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
      data: {
        userId: params.userId ?? null,
        path: params.path,
        method: params.method,
        status: params.status ?? null,
        ip: params.ip ?? null,
        ...attachUaField({}, params.ua),
      } as any,
    });
  } catch {
    // best-effort
  }
}

