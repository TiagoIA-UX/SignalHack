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

  // Common Node/pg error codes bubble through meta or nested objects
  const message = typeof anyErr.message === "string" ? anyErr.message : "";
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("Authentication failed") ||
    message.includes("connect ECONNREFUSED")
  ) {
    return true;
  }

  // Prisma sometimes nests provider-specific info in `meta` or other fields — stringify and search defensively
  try {
    const serialized = JSON.stringify(anyErr);
    if (serialized.includes("ECONNREFUSED") || serialized.includes("connect ECONNREFUSED") || serialized.includes("Authentication failed")) {
      return true;
    }
  } catch (e) {
    // ignore
  }

  // Also check common nested meta fields
  const meta = (anyErr as any).meta;
  if (meta && typeof meta === "object") {
    const metaStr = Object.values(meta).join(" ");
    if (metaStr.includes("ECONNREFUSED") || metaStr.includes("Authentication failed")) return true;
  }

  return false;
}
