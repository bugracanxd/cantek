// Basit in-memory rate limiter (tek instance için yeterli; çoklu instance/production'da
// Redis tabanlı bir çözüm - örn. Upstash Ratelimit - kullanılması önerilir).
const buckets = new Map();

export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false };
  }
  return { allowed: true };
}
