import request from "supertest";
import app from "../../server";

import { ChatService } from "../../services/chatService";
import { ChatHistoryService } from "../../services/chatHistoryService";
import { ChatResultMapper } from "../../middleware/chatResultMapper";

jest.mock("../../services/chatService");
jest.mock("../../services/chatHistoryService");
jest.mock("../../middleware/chatResultMapper");

describe("AI Chat Controller", () => {
  const validUserId = "abc123";
  const validChatId = "chat_123";
  const validMessage = "Hello";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // POST /api/ai/chats
  // ------------------------------------------

  describe("POST /api/ai/chats", () => {
    it("should create a chat and map the response", async () => {
      const mockChatResponse = {
        chatId: validChatId,
        title: "Hello",
      };

      (ChatService.createChat as jest.Mock).mockResolvedValue(mockChatResponse);

      (ChatResultMapper.toHttp as jest.Mock).mockImplementation((res, data) => {
        return res.status(200).json(data);
      });

      const res = await request(app).post("/api/ai/chats").send({
        message: validMessage,
        userId: validUserId,
      });

      expect(ChatService.createChat).toHaveBeenCalledWith(
        validUserId,
        validMessage,
      );

      expect(ChatResultMapper.toHttp).toHaveBeenCalledWith(
        expect.any(Object),
        mockChatResponse,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChatResponse);
    });

    it("should return 500 if ChatService.createChat fails", async () => {
      (ChatService.createChat as jest.Mock).mockRejectedValue(
        new Error("Service failure"),
      );

      const res = await request(app).post("/api/ai/chats").send({
        message: validMessage,
        userId: validUserId,
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  // ------------------------------------------
  // POST /api/ai/chats/:chatId
  // ------------------------------------------

  describe("POST /api/ai/chats/:chatId", () => {
    it("should send a message to an existing chat and map the response", async () => {
      const mockChatResponse = {
        reply: "Hi there",
      };

      (ChatService.sendMessageToChatById as jest.Mock).mockResolvedValue(
        mockChatResponse,
      );

      (ChatResultMapper.toHttp as jest.Mock).mockImplementation((res, data) => {
        return res.status(200).json(data);
      });

      const res = await request(app).post(`/api/ai/chats/${validChatId}`).send({
        message: validMessage,
        userId: validUserId,
      });

      expect(ChatService.sendMessageToChatById).toHaveBeenCalledWith(
        validMessage,
        validChatId,
        validUserId,
      );

      expect(ChatResultMapper.toHttp).toHaveBeenCalledWith(
        expect.any(Object),
        mockChatResponse,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChatResponse);
    });

    it("should return 500 if ChatService.sendMessageToChatById fails", async () => {
      (ChatService.sendMessageToChatById as jest.Mock).mockRejectedValue(
        new Error("Service failure"),
      );

      const res = await request(app).post(`/api/ai/chats/${validChatId}`).send({
        message: validMessage,
        userId: validUserId,
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  // ------------------------------------------
  // GET /api/ai/chats/:chatId/history
  // ------------------------------------------

  describe("GET /api/ai/chats/:chatId/history", () => {
    it("should return chat history", async () => {
      const mockHistory = [
        {
          message: "Hello",
          reply: "World",
        },
        {
          message: "How are you?",
          reply: "I'm good.",
        },
      ];

      (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue(
        mockHistory,
      );

      const res = await request(app).get(
        `/api/ai/chats/${validChatId}/history`,
      );

      expect(ChatHistoryService.getHistory).toHaveBeenCalledWith(validChatId);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        messages: mockHistory,
      });
    });

    it("should return 500 if ChatHistoryService fails", async () => {
      (ChatHistoryService.getHistory as jest.Mock).mockRejectedValue(
        new Error("DB failure"),
      );

      const res = await request(app).get(
        `/api/ai/chats/${validChatId}/history`,
      );

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  // ------------------------------------------
  // GET /api/ai/chats
  // ------------------------------------------

  describe("GET /api/ai/chats", () => {
    it("should return the user's chat sessions", async () => {
      const mockChatResponse = {
        type: "success",
        chats: [],
      };

      (ChatService.getUserChats as jest.Mock).mockResolvedValue(
        mockChatResponse,
      );

      (ChatResultMapper.toHttp as jest.Mock).mockImplementation((res, data) => {
        return res.status(200).json(data);
      });

      const res = await request(app)
        .get("/api/ai/chats")
        .query({ userId: validUserId });

      expect(ChatService.getUserChats).toHaveBeenCalledWith(validUserId);

      expect(ChatResultMapper.toHttp).toHaveBeenCalledWith(
        expect.any(Object),
        mockChatResponse,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChatResponse);
    });

    it("should return 400 if userId is missing", async () => {
      const res = await request(app).get("/api/ai/chats");

      expect(res.status).toBe(400);
    });

    it("should return 500 if ChatService.getUserChats fails", async () => {
      (ChatService.getUserChats as jest.Mock).mockRejectedValue(
        new Error("Service failure"),
      );

      const res = await request(app)
        .get("/api/ai/chats")
        .query({ userId: validUserId });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });
});
