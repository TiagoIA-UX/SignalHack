import { logEvent } from "@/lib/logger";

type Bucket = {
  count: number;
  resetAtMs: number;
};

const store = new Map<string, Bucket>();

type RateLimitResult = { ok: boolean; remaining: number; resetAtMs: number };

let upstashInitAttempted = false;
let upstashAvailable = false;
let upstashRedis: import("@upstash/redis").Redis | null = null;
const upstashLimiters = new Map<string, import("@upstash/ratelimit").Ratelimit>();

const isProd = process.env.NODE_ENV === "production";
let loggedProdNoUpstash = false;

function msToWindowString(windowMs: number): import("@upstash/ratelimit").Duration {
  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  return `${seconds} s` as import("@upstash/ratelimit").Duration;
}

async function getUpstashLimiter(opts: { windowMs: number; max: number }) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;

  if (!upstashInitAttempted) {
    upstashInitAttempted = true;
    try {
      const { Redis } = await import("@upstash/redis");
      upstashRedis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      upstashAvailable = true;
    } catch {
      upstashAvailable = false;
      upstashRedis = null;
    }
  }

  if (!upstashAvailable || !upstashRedis) return null;

  const key = `${opts.max}:${opts.windowMs}`;
  const existing = upstashLimiters.get(key);
  if (existing) return existing;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const limiter = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.fixedWindow(opts.max, msToWindowString(opts.windowMs)),
    analytics: true,
    prefix: "signalhack:rl",
  });

  upstashLimiters.set(key, limiter);
  return limiter;
}

export function rateLimit(key: string, opts: { windowMs: number; max: number }) {
  // Em produção, não usamos fallback in-memory (não é distribuído).
  // Rotas server-side devem usar `rateLimitAsync` + Upstash.
  if (isProd) {
    if (!loggedProdNoUpstash) {
      loggedProdNoUpstash = true;
      logEvent("error", "rate_limit.sync_called_in_production", { extra: { keyPrefix: key.split(":").slice(0, 2).join(":"), max: opts.max, windowMs: opts.windowMs } });
    }
    return { ok: false, remaining: 0, resetAtMs: Date.now() + opts.windowMs };
  }

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

export async function rateLimitAsync(key: string, opts: { windowMs: number; max: number }): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter(opts);
  if (limiter) {
    try {
      const r = await limiter.limit(key);
      const resetAtMs = typeof r.reset === "number" ? r.reset : Date.now() + opts.windowMs;
      return { ok: r.success, remaining: r.remaining, resetAtMs };
    } catch {
      // fallback apenas fora de produção
    }
  }

  if (isProd) {
    if (!loggedProdNoUpstash) {
      loggedProdNoUpstash = true;
      logEvent("error", "rate_limit.upstash_not_configured", {
        extra: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          keyPrefix: key.split(":").slice(0, 2).join(":"),
          max: opts.max,
          windowMs: opts.windowMs,
        },
      });
    }
    return { ok: false, remaining: 0, resetAtMs: Date.now() + opts.windowMs };
  }

  return rateLimit(key, opts);
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
