const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

jest.mock("../../services/redisService", () => ({
  getRedisClient: jest.fn(() => mockRedis),
}));

jest.mock("../../db/operations", () => ({
  getStreamChatHistoryFromDB: jest.fn(),
}));

import { ChatHistoryService } from "../../services/chatHistoryService";
import { getStreamChatHistoryFromDB } from "../../db/operations";

describe("ChatHistoryService", () => {
  const userId: string = "user-123";
  const cacheKey: string = `chat_history:${userId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // getHistory  - cache hit
  // -----------------------------
  it("should return cached chat history if available", async () => {
    const cached: { [x: string]: any }[] = [{ message: "Hi", reply: "Hello" }];

    mockRedis.get.mockResolvedValue(cached);

    const result: { [x: string]: any }[] =
      await ChatHistoryService.getHistory(userId);

    expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
    expect(result).toEqual(cached);
    expect(getStreamChatHistoryFromDB).not.toHaveBeenCalled();
  });

  // -----------------------------
  // getHistory - cache missing
  // -----------------------------
  it("should fetch messages from DB and cache result", async () => {
    mockRedis.get.mockResolvedValue(null);

    const dbData: { [x: string]: any }[] = [
      { message: "DB Hi", reply: "DB Hello" },
    ];
    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue(dbData);

    const result: { [x: string]: any }[] =
      await ChatHistoryService.getHistory(userId);

    expect(getStreamChatHistoryFromDB).toHaveBeenCalledWith(userId);
    expect(mockRedis.set).toHaveBeenCalledWith(cacheKey, dbData, { ex: 600 });
    expect(result).toEqual(dbData);
  });

  // -----------------------------
  // getHistory - cache invalid
  // -----------------------------
  it("should ignore invalid cache and fetch messages from DB", async () => {
    mockRedis.get.mockResolvedValue("corrupted-data");

    const dbData: { [x: string]: any }[] = [
      { message: "Clean", reply: "Data" },
    ];
    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue(dbData);

    const result: { [x: string]: any }[] =
      await ChatHistoryService.getHistory(userId);

    expect(getStreamChatHistoryFromDB).toHaveBeenCalledWith(userId);
    expect(result).toEqual(dbData);
  });

  // -----------------------------
  // getHistory - empty DB result
  // -----------------------------
  it("should not cache messages if DB returns empty array", async () => {
    mockRedis.get.mockResolvedValue(null);

    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue([]);

    const result: { [x: string]: any }[] =
      await ChatHistoryService.getHistory(userId);

    expect(mockRedis.set).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  // -----------------------------
  // addMessageToHistory - cache exists
  // -----------------------------
  it("should append message to cached chat history", async () => {
    const cached: { [x: string]: any }[] = [{ message: "Hi", reply: "Hello" }];

    mockRedis.get.mockResolvedValue([...cached]);

    await ChatHistoryService.addMessageToHistory(
      userId,
      "New message",
      "New reply",
    );

    expect(mockRedis.set).toHaveBeenCalledWith(
      cacheKey,
      [...cached, { message: "New message", reply: "New reply" }],
      { ex: 600 },
    );
  });

  // -----------------------------
  // addMessageToHistory - no cache
  // -----------------------------
  it("should do nothing if cache data does not exist", async () => {
    mockRedis.get.mockResolvedValue(null);

    await ChatHistoryService.addMessageToHistory(userId, "Msg", "Reply");

    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  // -----------------------------
  // addMessageToHistory - invalid cache
  // -----------------------------
  it("should do nothing if cache data is invalid", async () => {
    mockRedis.get.mockResolvedValue("invalid");

    await ChatHistoryService.addMessageToHistory(userId, "Msg", "Reply");

    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  // -----------------------------
  // invalidateHistory
  // -----------------------------
  it("should delete cached chat history", async () => {
    mockRedis.del.mockResolvedValue(1);

    await ChatHistoryService.invalidateHistory(userId);

    expect(mockRedis.del).toHaveBeenCalledWith(cacheKey);
  });
});