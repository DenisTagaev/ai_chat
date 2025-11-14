import { Redis } from "@upstash/redis";

let _redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (_redisClient) return _redisClient;

  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "[Upstash Redis] Missing environment variables: UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN"
    );
  }

  _redisClient = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });

  console.log("Connected to Upstash Redis");

  return _redisClient;
}
