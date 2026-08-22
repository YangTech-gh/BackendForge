import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheAside<T> {
  constructor(private prefix: string, private ttlSeconds: number) {}

  async getOrSet(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = await redis.get(`${this.prefix}:${key}`);
    if (cached) return JSON.parse(cached);
    const value = await fetcher();
    await redis.setex(`${this.prefix}:${key}`, this.ttlSeconds, JSON.stringify(value));
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await redis.del(`${this.prefix}:${key}`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(`${this.prefix}:${pattern}`);
    if (keys.length) await redis.del(...keys);
  }
}

export async function cacheStampedePrevention<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const lockKey = `lock:${key}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const acquired = await redis.set(lockKey, '1', 'EX', 5, 'NX');
  if (acquired) {
    try {
      const value = await fetcher();
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return value;
    } finally {
      await redis.del(lockKey);
    }
  }
  await new Promise(r => setTimeout(r, 100));
  const retry = await redis.get(key);
  return retry ? JSON.parse(retry) : fetcher();
}
