// Redis In-Memory Caching & Session Store Configuration
import dotenv from 'dotenv';
dotenv.config();

let RedisClientClass: any;
try {
  RedisClientClass = require('ioredis');
} catch {
  // In-memory fallback map if ioredis is not yet installed in node_modules
  RedisClientClass = class MockRedis {
    private cache = new Map<string, string>();
    async get(key: string) { return this.cache.get(key) || null; }
    async set(key: string, val: string) { this.cache.set(key, val); return 'OK'; }
    async setex(key: string, seconds: number, val: string) { this.cache.set(key, val); return 'OK'; }
    async del(key: string) { this.cache.delete(key); return 1; }
    on() { return this; }
  };
}

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new RedisClientClass(redisUrl, {
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
