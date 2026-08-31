import { Redis, SetCommandOptions } from "@upstash/redis";
import { logger } from "../utils/logger";
import { TimeoutError, withTimeout } from "../utils/timeout";
import { serializeError } from "../utils/errorSerializer";

export class RedisClient{
  private readonly client: Redis;

  constructor() {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "[Upstash Redis] Missing environment variables: REDIS URL and/or REDIS TOKEN"
      );
    }

    this.client = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN
    });

    console.log("Connected to Upstash Redis");
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await withTimeout(
        this.client.get<T>(key),
        5000,
        "Redis GET call"
      );
    } catch (err: unknown) {
      if (err instanceof TimeoutError) {
        logger.warn({ key, err }, "redis.get.timeout");
      } else {
        logger.error(
          {
            key,
            err: serializeError(err)
          },
          "redis.get.fail"
        );
      }
      throw err;
    }
  }

  async set(
    key: string,
    value: { [x: string]: any },
    options? : SetCommandOptions
  ): Promise<unknown> {
    try {
      return await withTimeout(
        this.client.set(key, value, options),
        5000,
        "Redis SET call"
      );
    } catch (err: unknown) {
      if (err instanceof TimeoutError) {
        logger.warn({ key, err }, "redis.set.timeout");
      } else {
        logger.error(
          {
            key,
            err: serializeError(err)
          },
          "redis.set.fail"
        );
        throw err;
      }
    }
  };

  async del(key: string): Promise<number> {
    try {
      return await withTimeout(
        this.client.del(key),
        5000,
        "Redis DEL call"
      );
    } catch (err: unknown) {
      if (err instanceof TimeoutError) {
        logger.warn({ key, err }, "redis.del.timeout");
      } else {
        logger.error(
          {
            key,
            err: serializeError(err)
          },
          "redis.del.fail"
        );
      }
      throw err;
    }
  }

  public _getClient(): Redis {
    return this.client;
  }
}

let redisService: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  redisService ??= new RedisClient();
  return redisService
}