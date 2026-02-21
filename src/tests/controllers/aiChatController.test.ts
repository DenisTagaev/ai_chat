const redisMock = {
  del: jest.fn().mockResolvedValue(1),
  set: jest.fn(),
  get: jest.fn()
};

jest.mock("../../services/redisService", () => ({
  getRedisClient: jest.fn(() => redisMock),
}));

import request from "supertest";
import app from "../../server";
import {
  getNeonUserById,
  getStreamChatHistoryFromDB,
  saveStreamChatMessageToDB,
} from "../../db/operations";
import { APIResponse, UserResponse } from "stream-chat";
import {
  checkRegisteredStreamUser,
  createAiChatChannel,
  sendMessageToAi,
} from "../../services/streamChatService";
import { geminiAiService } from "../../services/geminiAiService";

jest.mock("../../db/operations");
jest.mock("../../services/geminiAiService");
jest.mock("../../services/streamChatService");
jest.mock("../../services/redisService");

describe("handleAiChat", () => {
  const validBody = { message: "Hello", userId: "abc123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    app.listen().close();
  });

  it("should throw an error if user does not exist in Stream", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: "abc123" }]);
    (checkRegisteredStreamUser as jest.Mock).mockResolvedValue({
      users: [] as UserResponse[],
    } as APIResponse & { users: UserResponse[] });

    const res = await request(app)
      .post("/api/ai/chat")
      .send(validBody)
      .expect(404);

    expect(res.body.error).toBe("User not found");
    expect(checkRegisteredStreamUser).toHaveBeenCalledWith("abc123");
  });

  it("should throw an error if user does not exist in Neon", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post("/api/ai/chat")
      .send(validBody)
      .expect(404);

    expect(res.body.error).toBe("User not found");
    expect(getNeonUserById).toHaveBeenCalledWith("abc123");
  });

  it("should throw an error if missing userId or message", async () => {
    const res = await request(app).post("/api/ai/chat").send({ message: "Hi" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("POST /chat - should generate AI reply and persist chat", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: "abc123" }]);
    (checkRegisteredStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: "abc123" }],
    });
    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue([
      { message: "Hello", reply: "World" },
    ]);

    (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
      "Hello World"
    );
    (createAiChatChannel as jest.Mock).mockResolvedValue({ id: "chan1"});
    (sendMessageToAi as jest.Mock).mockResolvedValue({});
    (saveStreamChatMessageToDB as jest.Mock).mockResolvedValue({});

    const res = await request(app).post("/api/ai/chat").send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reply: "Hello World"});

    expect(geminiAiService.generateResponse).toHaveBeenCalledWith(
      validBody.message,
      [
        { role: "user", content: "Hello" },
        { role: "model", content: "World" },
      ]
    );

    expect(saveStreamChatMessageToDB).toHaveBeenCalledWith(
      validBody.userId,
      validBody.message,
      "Hello World"
    );

    expect(sendMessageToAi).toHaveBeenCalledWith(
      { id: "chan1" },
      "Hello World"
    );
  });

  it("should return 500 if AI service fails", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([
      { id: validBody.userId },
    ]);
    (checkRegisteredStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: validBody.userId }] as UserResponse[],
    } as APIResponse & { users: UserResponse[] });

    (geminiAiService.generateResponse as jest.Mock).mockRejectedValue(
        new Error("Gemini failure")
    );

    const res = await request(app).post("/api/ai/chat").send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});

describe("getUserChatHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    app.listen().close();
  });

  it("should return 400 if userId is missing", async () => {
    const res = await request(app).post("/api/ai/chat-history").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("/POST chat-history - should return cached messages if available", async () => {
    const cachedMessages = [{ id: 1, userId: "abc123", message: "Hello" }];

    redisMock.get.mockResolvedValue(JSON.stringify(cachedMessages));

    const res = await request(app).post("/api/ai/chat-history").send({ userId: "abc123" });

    expect(redisMock.get).toHaveBeenCalledWith("chat_history:abc123");
    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual(cachedMessages);
  });

  it("/POST chat-history - should return DB messages and store them into cache", async () => {
    redisMock.get.mockResolvedValue(null);
    const dbMessages = [{ id: 1, userId: "abc123", message: "Hi from DB" }];
    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue(dbMessages);

    const res = await request(app)
      .post("/api/ai/chat-history")
      .send({ userId: "abc123" });

    expect(redisMock.get).toHaveBeenCalledWith("chat_history:abc123");
    expect(getStreamChatHistoryFromDB).toHaveBeenCalledWith("abc123");
    expect(redisMock.set).toHaveBeenCalledWith(
      "chat_history:abc123",
      JSON.stringify(dbMessages),
      { ex: 600 }
    );

    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual(dbMessages);
  });

  it("should delete cache if corrupted and fetch from DB", async () => {
    redisMock.get.mockResolvedValue("INVALID JSON");
    const dbMessages = [{ id: 99, userId: "abc123", message: "Clean DB data" }];
    (getStreamChatHistoryFromDB as jest.Mock).mockResolvedValue(dbMessages);

    const res = await request(app).post("/api/ai/chat-history").send({ userId: "abc123" });

    expect(redisMock.del).toHaveBeenCalledWith("chat_history:abc123");
    expect(getStreamChatHistoryFromDB).toHaveBeenCalledWith("abc123");

    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual(dbMessages);
  });

  it("should return 500 if an internal error occurs", async () => {
    redisMock.get.mockResolvedValue(null);
    (getStreamChatHistoryFromDB as jest.Mock).mockRejectedValue(new Error("Failed to get AI response"));

    const res = await request(app).post("/api/ai/chat-history").send({ userId: "abc123" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");
  });
});