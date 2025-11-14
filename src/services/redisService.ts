import { createClient, RedisClientType } from "redis";

const redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379";

export const redisService: RedisClientType<any> = createClient({ url: redisUrl });

redisService.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

// Connect once at startup
await redisService.connect();
console.log("Redis connected");
