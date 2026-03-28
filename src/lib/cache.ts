import { redis } from "./ratelimit";

export const CACHE_KEYS = {
    // profile:userId
    PROFILE: (userId: string) => `profile:${userId}`,
};

export const CACHE_TIMES = {
    PROFILE: 60 * 60 * 24, // 24 hours
};

/**
 * Get cached profile from Redis
 */
export async function getCachedProfile(userId: string) {
    try {
        const cached = await redis.get(CACHE_KEYS.PROFILE(userId));
        if (cached) {
            console.log(`[CACHE] Hit for profile:${userId}`);
            // Upstash Redis SDK might return object directly if parsed, but usually it depends on usage
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
    } catch (e) {
        console.error(`[CACHE] Get error for ${userId}:`, e);
    }
    return null;
}

/**
 * Set profile in Redis cache
 */
export async function setCachedProfile(userId: string, profile: any) {
    try {
        if (!profile) return;
        await redis.set(CACHE_KEYS.PROFILE(userId), JSON.stringify(profile), {
            ex: CACHE_TIMES.PROFILE
        });
        console.log(`[CACHE] Set for profile:${userId}`);
    } catch (e) {
        console.error(`[CACHE] Set error for ${userId}:`, e);
    }
}

/**
 * Invalidate profile cache
 */
export async function invalidateProfileCache(userId: string) {
    try {
        await redis.del(CACHE_KEYS.PROFILE(userId));
        console.log(`[CACHE] Invalidated profile:${userId}`);
    } catch (e) {
        console.error(`[CACHE] Invalidate error for ${userId}:`, e);
    }
}
