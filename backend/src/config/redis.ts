// Redis In-Memory Caching & Session Store Configuration
import { env } from './env';

if (!env.REDIS_URL) {
 throw new Error('REDIS_URL must be configured before the Redis cache is used');
}

const RedisClientClass = require('ioredis');

export const redis = new RedisClientClass(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on?.('connect', () => {
  console.log('✅ Redis Cache connected successfully');
});

redis.on?.('error', (err: any) => {
  console.warn('⚠️ Redis Cache warning/error:', err?.message || err);
});

export const cacheSet = async (key: string, value: any, ttlSeconds: number = 3600) => {
  try {
    const dataStr = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, dataStr);
  } catch (error) {
    console.error('Error setting Redis cache key:', key, error);
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const dataStr = await redis.get(key);
    if (!dataStr) return null;
    return JSON.parse(dataStr) as T;
  } catch (error) {
    console.error('Error getting Redis cache key:', key, error);
    return null;
  }
};
