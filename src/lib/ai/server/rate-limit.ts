import "server-only";

const MAX_KEYS = 5000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterS: number };

/**
 * Best-effort sliding-window limiter held in memory per server instance. It blunts
 * bursts against the paid model endpoint; a hard global limit needs a shared store
 * such as Redis.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false, retryAfterS: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
    }
    recent.push(now);
    hits.delete(key);
    hits.set(key, recent);
    // Evict the least recently seen clients so memory stays bounded.
    for (const oldest of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      hits.delete(oldest);
    }
    return { ok: true };
  };
}
