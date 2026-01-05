type Bucket = {
  count: number;
  resetAtMs: number;
};

const store = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { windowMs: number; max: number }) {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAtMs <= now) {
    const bucket: Bucket = { count: 1, resetAtMs: now + opts.windowMs };
    store.set(key, bucket);
    return { ok: true, remaining: opts.max - 1, resetAtMs: bucket.resetAtMs };
  }

  if (existing.count >= opts.max) {
    return { ok: false, remaining: 0, resetAtMs: existing.resetAtMs };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.max - existing.count, resetAtMs: existing.resetAtMs };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
