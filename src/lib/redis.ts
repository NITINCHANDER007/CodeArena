import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export const getRedisClient = (): Redis => {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    globalForRedis.redisClient.on("error", (err) => {
      // Avoid crashing when Redis is not yet running
      console.warn("⚠️ Redis client warning:", err.message);
    });
  }
  return globalForRedis.redisClient;
};

export default getRedisClient;
