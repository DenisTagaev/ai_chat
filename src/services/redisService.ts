import { Redis } from "@upstash/redis";

export class RedisService{
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
    return this.client.get<T>(key);
  }

  async set(
    key: string,
    value: [],
    options? : { ex?: number }
  ): Promise<unknown> {
    return this.client.set(key, value, options)
  };

  public _getClient(): Redis {
    return this.client;
  }
}
