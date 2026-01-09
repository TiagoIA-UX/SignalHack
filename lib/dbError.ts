export function isDbUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const anyErr = err as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };

  // Prisma known codes
  const code = typeof anyErr.code === "string" ? anyErr.code : "";
  if (code === "P1000" || code === "P1001" || code === "P1017") return true;

  // Common Node/pg error codes bubble through meta
  const message = typeof anyErr.message === "string" ? anyErr.message : "";
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("Authentication failed") ||
    message.includes("connect ECONNREFUSED")
  ) {
    return true;
  }

  return false;
}
