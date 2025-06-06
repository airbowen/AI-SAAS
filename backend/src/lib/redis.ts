import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function cacheUserInfo(userId: string, userInfo: any) {
  await redis.setex(`user:${userId}`, 300, JSON.stringify(userInfo)); // 5分钟缓存
}

export async function getCachedUserInfo(userId: string) {
  const cached = await redis.get(`user:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

export default redis;