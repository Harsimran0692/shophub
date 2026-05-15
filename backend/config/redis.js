import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  tls: process.env.REDIS_URL?.startsWith("rediss://")
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

redis.on("error", (err) => {
  console.error(`Error connecting to redis ${err}`);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

export default redis;
