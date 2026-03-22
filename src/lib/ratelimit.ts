import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// 1. Initialize Redis Client
// Pulls from UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN automatically
export const redis = Redis.fromEnv();

/**
 * Standard Limiter: 10 requests per 10 seconds.
 * Suitable for general dashboard/profile updates.
 */
export const standardLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit-standard",
});

/**
 * Strict Limiter: 5 attempts per 1 minute.
 * Specifically for mobile OTP generation and registration to prevent SMS/Auth abuse.
 */
export const strictLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit-strict",
});

/**
 * Utility to get client IP for rate limiting inside Server Actions.
 * Handles headers() requirement in Next.js.
 */
export async function getClientIp() {
    const { headers } = await import("next/headers");
    const headerInstance = await headers();
    const forwardedFor = headerInstance.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0];
    }
    return "127.0.0.1";
}
