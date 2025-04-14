import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval?: number;
}

export default function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) || 0) + 1;
      tokenCache.set(token, tokenCount);
      
      const currentUsage = tokenCount || 0;
      const isRateLimited = currentUsage > limit;
      
      return {
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
        success: !isRateLimited
      };
    }
  };
}

export const limiter = rateLimit({
  interval: 5 * 60 * 1000,
  uniqueTokenPerInterval: 500
});