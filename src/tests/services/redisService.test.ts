import { RedisClient } from "../../services/redisService";
import { Redis } from "@upstash/redis";

jest.mock("@upstash/redis");

describe("RedisClient", () => {
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockDel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.UPSTASH_REDIS_REST_URL = "test-url";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockDel = jest.fn();

    (Redis as unknown as jest.Mock).mockImplementation(() => ({
      get: mockGet,
      set: mockSet,
      del: mockDel,
    }));
  });

  // -----------------------------
  // constructor
  // -----------------------------
  it("should throw an error if env variables are missing", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    expect(() => new RedisClient()).toThrow(
      "[Upstash Redis] Missing environment variables: REDIS URL and/or REDIS TOKEN",
    );
  });

  it("should initialize Redis client with env variables", () => {
    const client: RedisClient = new RedisClient();

    expect(Redis).toHaveBeenCalledWith({
      url: "test-url",
      token: "test-token",
    });

    expect(client._getClient()).toBeDefined();
  });

  // -----------------------------
  // get
  // -----------------------------
  it("should call get and return a client by the key", async () => {
    const client: RedisClient = new RedisClient();

    mockGet.mockResolvedValue("value");

    const result: unknown = await client.get("key");

    expect(mockGet).toHaveBeenCalledWith("key");
    expect(result).toBe("value");
  });

  // -----------------------------
  // set
  // -----------------------------
  it("should call set without options", async () => {
    const client = new RedisClient();

    const value = { foo: "bar" };

    mockSet.mockResolvedValue("OK");

    const result = await client.set("key", value);

    expect(mockSet).toHaveBeenCalledWith("key", value, undefined);
    expect(result).toBe("OK");
  });

  it("should call set with key, value and options", async () => {
    const client: RedisClient = new RedisClient();

    const value: { test: any } = { test: "string" };
    const options: { ex: number } = { ex: 10 };

    mockSet.mockResolvedValue("OK");

    const result: unknown = await client.set("key", value, options);

    expect(mockSet).toHaveBeenCalledWith("key", value, options);
    expect(result).toBe("OK");
  });

  // -----------------------------
  // del
  // -----------------------------
  it("should call del and remove corresponding key", async () => {
    const client: RedisClient = new RedisClient();

    mockDel.mockResolvedValue(1);

    const result: unknown = await client.del("key");

    expect(mockDel).toHaveBeenCalledWith("key");
    expect(result).toBe(1);
  });
});

describe("getRedisClient", () => {
  beforeEach(() => {
    jest.resetModules();

    process.env.UPSTASH_REDIS_REST_URL = "test-url";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  it("should return the same instance (singleton)", () => {
    const { getRedisClient } = require("../../services/redisService");

    const client1: RedisClient = getRedisClient();
    const client2: RedisClient = getRedisClient();

    expect(client1).toBe(client2);
  });

  it("should make a call to create instance only once", () => {
    const { getRedisClient } = require("../../services/redisService");
    const { Redis } = require("@upstash/redis");

    getRedisClient();
    getRedisClient();

    expect(Redis).toHaveBeenCalledTimes(1);
  });
});
