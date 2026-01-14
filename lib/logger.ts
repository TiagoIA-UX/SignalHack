// import * as Sentry from "@sentry/nextjs";

export type LogLevel = "info" | "warn" | "error";

export type LogContext = {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  status?: number;
  ip?: string;
  ua?: string | null;
  action?: string;
  extra?: Record<string, unknown>;
};

function safeError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return { name: "UnknownError", message: String(err) };
}

export function getRequestIdFromHeaders(headers: Headers): string | undefined {
  const v = headers.get("x-request-id") ?? headers.get("x-correlation-id") ?? undefined;
  return v && v.trim() ? v : undefined;
}

export function logEvent(level: LogLevel, message: string, ctx: LogContext = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    requestId: ctx.requestId,
    userId: ctx.userId,
    path: ctx.path,
    method: ctx.method,
    status: ctx.status,
    ip: ctx.ip,
    ua: ctx.ua,
    action: ctx.action,
    extra: ctx.extra,
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function captureException(err: unknown, ctx: LogContext = {}) {
  // Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
  //   tags: {
  //     requestId: ctx.requestId,
  //     path: ctx.path,
  //     method: ctx.method,
  //   },
  //   user: ctx.userId ? { id: ctx.userId } : undefined,
  //   extra: {
  //     ...ctx.extra,
  //     status: ctx.status,
  //     ip: ctx.ip,
  //     ua: ctx.ua,
  //     error: safeError(err),
  //   },
  // });
  console.error("Exception captured:", safeError(err), ctx);
}

export function captureMessage(message: string, ctx: LogContext = {}) {
  // Sentry.captureMessage(message, {
  //   tags: {
  //     requestId: ctx.requestId,
  //     path: ctx.path,
  //     method: ctx.method,
  //   },
  //   user: ctx.userId ? { id: ctx.userId } : undefined,
  //   extra: ctx.extra,
  // });
  console.log("Message captured:", message, ctx);
}
