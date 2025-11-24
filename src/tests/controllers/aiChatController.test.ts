const redisMock = { del: jest.fn().mockResolvedValue(1) };
jest.mock("../../services/redisService", () => ({
  getRedisClient: jest.fn(() => redisMock),
}));

import request from "supertest";
import { Request, Response } from "express";
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
import { getAiChatResponse } from "../../services/openAiService";
import { handleAiChat } from "../../controllers/aiChatController";

jest.mock("../../db/operations");
jest.mock("../../services/openAiService");
jest.mock("../../services/streamChatService");
jest.mock("../../services/redisService");

describe("aiChatController", () => {
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

  it("POST /chat - should open a new Stream chat", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: "abc123" }]);
    (checkRegisteredStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: "abc123" }],
    });

    async function* mockStream() {
      yield { choices: [{ delta: { content: "Hello" } }] };
      yield { choices: [{ delta: { content: " World" } }] };
    }

    (getAiChatResponse as jest.Mock).mockReturnValue(mockStream());
    (createAiChatChannel as jest.Mock).mockResolvedValue({ id: "chan1" });
    (sendMessageToAi as jest.Mock).mockResolvedValue({});
    (saveStreamChatMessageToDB as jest.Mock).mockResolvedValue({});

    const res = await request(app).post("/api/ai/chat").send(validBody);

    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
    expect(saveStreamChatMessageToDB).toHaveBeenCalledWith(
      validBody.userId,
      "Hello",
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

    (getAiChatResponse as jest.Mock).mockImplementation(async function* () {
      throw new Error("Failed to get AI response");
    });

    const req = { body: validBody } as Request;

    const writeMock = jest.fn();
    const endMock = jest.fn();
    const setHeaderMock = jest.fn();
    const flushHeadersMock = jest.fn();

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      write: writeMock,
      end: endMock,
      setHeader: setHeaderMock,
      flushHeaders: flushHeadersMock,
      headersSent: false,
    } as Partial<Response> as Response;

    await handleAiChat(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});