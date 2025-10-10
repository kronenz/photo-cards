/**
 * Cache Utility
 * Feature: 003-navigation-ui-renewal
 * Task: T024
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
	data: T;
	expires: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Set a value in the cache with optional TTL
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function setCache<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
	cache.set(key, {
		data,
		expires: Date.now() + ttl
	});
}

/**
 * Get a value from the cache
 * @param key - Cache key
 * @returns Cached data or null if not found or expired
 */
export function getCache<T>(key: string): T | null {
	const cached = cache.get(key);

	if (!cached) {
		return null;
	}

	// Check if expired
	if (Date.now() > cached.expires) {
		cache.delete(key);
		return null;
	}

	return cached.data as T;
}

/**
 * Clear one or all cache entries
 * @param key - Optional specific key to clear. If omitted, clears all cache.
 */
export function clearCache(key?: string): void {
	if (key) {
		cache.delete(key);
	} else {
		cache.clear();
	}
}

/**
 * Check if a cache key exists and is not expired
 * @param key - Cache key
 * @returns true if key exists and is valid, false otherwise
 */
export function hasCache(key: string): boolean {
	const cached = cache.get(key);

	if (!cached) {
		return false;
	}

	if (Date.now() > cached.expires) {
		cache.delete(key);
		return false;
	}

	return true;
}

/**
 * Get or set pattern: Get from cache, or compute and cache if not found
 * @param key - Cache key
 * @param fn - Function to compute value if not in cache
 * @param ttl - Time to live in milliseconds
 * @returns Cached or computed value
 */
export async function cacheOrCompute<T>(
	key: string,
	fn: () => Promise<T> | T,
	ttl?: number
): Promise<T> {
	const cached = getCache<T>(key);

	if (cached !== null) {
		return cached;
	}

	const data = await fn();
	setCache(key, data, ttl);
	return data;
}

/**
 * Get cache statistics
 * @returns Object with cache size and expired entries count
 */
export function getCacheStats(): {
	size: number;
	expired: number;
} {
	let expired = 0;
	const now = Date.now();

	for (const [key, entry] of cache.entries()) {
		if (now > entry.expires) {
			expired++;
		}
	}

	return {
		size: cache.size,
		expired
	};
}

/**
 * Clean up expired cache entries
 * @returns Number of entries removed
 */
export function cleanupCache(): number {
	const now = Date.now();
	let removed = 0;

	for (const [key, entry] of cache.entries()) {
		if (now > entry.expires) {
			cache.delete(key);
			removed++;
		}
	}

	return removed;
}
