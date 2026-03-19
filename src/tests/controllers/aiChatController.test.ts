import request from "supertest";
import app from "../../server";
import { ChatService } from "../../services/chatService";
import { ChatHistoryService } from "../../services/chatHistoryService";
import { ChatResultMapper } from "../../middleware/chatResultMapper";

jest.mock("../../services/chatService");
jest.mock("../../services/chatHistoryService");
jest.mock("../../middleware/chatResultMapper");

describe("AI Chat Controller", () => {
  const validBody = { message: "Hello", userId: "abc123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // handleAiChat
  // -----------------------------
  describe("POST api/ai/chat", () => {
    it("should call ChatService and call mapper for response", async () => {
      const mockChatResponse = { reply: "Hi there" };

      (ChatService.interactWithChat as jest.Mock).mockResolvedValue(
        mockChatResponse,
      );

      (ChatResultMapper.toHttp as jest.Mock).mockImplementation((res, data) => {
        return res.status(200).json(data);
      });

      const res = await request(app).post("/api/ai/chat").send(validBody);

      expect(ChatService.interactWithChat).toHaveBeenCalledWith(
        validBody.message,
        validBody.userId,
      );

      expect(ChatResultMapper.toHttp).toHaveBeenCalledWith(
        expect.any(Object),
        mockChatResponse,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChatResponse);
    });

    it("should return 500 if ChatService throws error", async () => {
      (ChatService.interactWithChat as jest.Mock).mockRejectedValue(
        new Error("Service failure"),
      );

      const res = await request(app).post("/api/ai/chat").send(validBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal Server Error" });
    });
  });

  // -----------------------------
  // getUserChatHistory
  // -----------------------------
  describe("POST /api/ai/chat-history", () => {
    it("should return 400 if userId is missing", async () => {
      const res = await request(app).post("/api/ai/chat-history").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    it("should return chat history", async () => {
      const mockHistory = [{ message: "Hello", reply: "World" }];

      (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue(
        mockHistory,
      );

      const res = await request(app)
        .post("/api/ai/chat-history")
        .send({ userId: "abc123" });

      expect(ChatHistoryService.getHistory).toHaveBeenCalledWith("abc123");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ history: mockHistory });
    });

    it("should return 500 if ChatHistoryService fails", async () => {
      (ChatHistoryService.getHistory as jest.Mock).mockRejectedValue(
        new Error("DB failure"),
      );

      const res = await request(app)
        .post("/api/ai/chat-history")
        .send({ userId: "abc123" });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal Server Error" });
    });
  });
});