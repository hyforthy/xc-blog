import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval?: number;
}

export default function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, {count: number, limitedAt?: number}>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval
  });

  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      let entry = tokenCache.get(token) || {count: 0};
      // 如果存在entry但已过限制间隔，则重置
      if (entry.limitedAt && now - entry.limitedAt > options.interval) {
        entry = {count: 0};
      }

      const newCount = entry.count + 1;
      
      // 添加时间判断
      const isRateLimited = entry.limitedAt 
        ? true : newCount > limit; // 首次触发限制
      
      const newEntry = {
        count: newCount,
        limitedAt: entry.limitedAt || (isRateLimited ? now : undefined)
      }
      // 更新缓存（总是更新计数，但只在首次触发限制时记录时间）
      tokenCache.set(token, newEntry);
      
      return {
        success: !isRateLimited,
        remaining: isRateLimited ? 0 : limit - newCount,
        remainingMinutes: newEntry.limitedAt ? 
          Math.max(1, Math.ceil((newEntry.limitedAt + options.interval - Date.now()) / (60 * 1000))) : 
          undefined
      };
    }
  };
}

export const limiter = rateLimit({
  interval: 5 * 60 * 1000,
  uniqueTokenPerInterval: 500
});