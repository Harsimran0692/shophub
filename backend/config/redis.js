import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
});

console.log(process.env.REDIS_PORT);

redis.on("error", (err) => {
  console.error(`Error connecting to redis ${err}`);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

export default redis;
