import { Redis } from "@upstash/redis";

const mockRedisConstructor = jest.fn();
jest.mock("@upstash/redis", () => {
  return {
    Redis: jest.fn().mockImplementation((args) => {
      mockRedisConstructor(args);
      return { __mocked: true, args };
    }),
  };
});

import { getRedisClient } from "../../services/redisService";

describe("redisService", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  function loadIsolatedService() {
    let getRedisClient: any;
    jest.isolateModules(() => {
      getRedisClient = require("../../services/redisService").getRedisClient;
    });
    return getRedisClient;
  }

  it("throws error when env variables are missing", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(() => getRedisClient()).toThrow(
      "[Upstash Redis] Missing environment variables: UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN"
    );
  });

  it("creates a new Redis client when not initialized", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token123";

    const client = getRedisClient();

    expect(Redis).toHaveBeenCalledTimes(1);
    expect(mockRedisConstructor).toHaveBeenCalledWith({
      url: "https://fake.upstash.io",
      token: "token123",
    });

    expect(client).toEqual({
      __mocked: true,
      args: {
        url: "https://fake.upstash.io",
        token: "token123",
      },
    });
  });

  it("returns the same client on subsequent calls (singleton)", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token123";

    const RedisClient = loadIsolatedService();

    const client1 = RedisClient();
    const client2 = RedisClient();

    expect(client1).toBe(client2);
    expect(mockRedisConstructor).toHaveBeenCalledTimes(1);
  });
});
