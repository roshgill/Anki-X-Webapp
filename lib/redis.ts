import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | null = null;

export const getRedisClient = async () => {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL, // Ensure you have this in `.env.local`
    });

    redis.on('error', (err) => console.error('❌ Redis Error:', err));

    await redis.connect();
    console.log("✅ Redis Connected Successfully"); // Log success
  }

  return redis;
};