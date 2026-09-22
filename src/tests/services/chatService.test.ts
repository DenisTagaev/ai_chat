jest.mock("../../db/operations", () => ({
  createChatSession: jest.fn(),
  getChatSessionsByUserId: jest.fn(),
  persistChatMessage: jest.fn(),
}));

jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    getOrCreateChatChannel: jest.fn(),
    sendUserMessage: jest.fn(),
    sendAiMessage: jest.fn(),
  },
}));

jest.mock("../../services/chatHistoryService", () => ({
  ChatHistoryService: {
    getHistory: jest.fn(),
    addMessageToHistory: jest.fn(),
  },
}));

jest.mock("../../services/geminiAiService", () => ({
  geminiAiService: {
    generateResponse: jest.fn(),
  },
}));

jest.mock("../../services/userService", () => ({
  UserService: {
    getUserRegisterState: jest.fn(),
  },
}));

jest.mock("../../utils/idGenerator", () => ({
  generateChatId: jest.fn(),
}));

import { ChatService } from "../../services/chatService";
import {
  createChatSession,
  getChatSessionsByUserId,
  persistChatMessage,
} from "../../db/operations";
import { StreamChatService } from "../../services/streamChatService";
import { ChatHistoryService } from "../../services/chatHistoryService";
import { geminiAiService } from "../../services/geminiAiService";
import { UserService } from "../../services/userService";
import { generateChatId } from "../../utils/idGenerator";
import {
  ChatResponse,
  ChatSessionResponse,
  ChatSessionsListResponse,
} from "../../utils/types";

describe("ChatService", () => {
  const userId = "user-123";
  const chatId = "chat-123";
  const message = "Hello AI";
  const updatedAt = new Date("2026-01-01T00:00:00.000Z");

  const registeredUserState = {
    isNeonUser: true,
    isStreamUser: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      registeredUserState,
    );

    (StreamChatService.getOrCreateChatChannel as jest.Mock).mockResolvedValue(
      undefined,
    );

    (StreamChatService.sendUserMessage as jest.Mock).mockResolvedValue(
      undefined,
    );

    (StreamChatService.sendAiMessage as jest.Mock).mockResolvedValue(undefined);

    (ChatHistoryService.addMessageToHistory as jest.Mock).mockResolvedValue(
      undefined,
    );
  });

  // ============================================================
  // getUserChats
  // ============================================================

  describe("getUserChats", () => {
    it("should return validation_error if userId is missing", async () => {
      const result: ChatSessionsListResponse =
        await ChatService.getUserChats("");

      expect(result).toEqual({
        type: "validation_error",
      });

      expect(UserService.getUserRegisterState).not.toHaveBeenCalled();
    });

    it("should return user_not_found if user registration is inconsistent", async () => {
      (UserService.getUserRegisterState as jest.Mock).mockResolvedValue({
        isNeonUser: true,
        isStreamUser: false,
      });

      const result: ChatSessionsListResponse =
        await ChatService.getUserChats(userId);

      expect(result).toEqual({
        type: "user_not_found",
      });

      expect(getChatSessionsByUserId).not.toHaveBeenCalled();
    });

    it("should return internal_error if retrieving chats fails", async () => {
      (getChatSessionsByUserId as jest.Mock).mockRejectedValue(
        new Error("Database failure"),
      );

      const result: ChatSessionsListResponse =
        await ChatService.getUserChats(userId);

      expect(result).toEqual({
        type: "internal_error",
      });
    });
  });

  // ============================================================
  // createChat
  // ============================================================

  describe("createChat", () => {
    it("should return validation_error if userId or firstMessage is missing", async () => {
      const result: ChatSessionResponse = await ChatService.createChat(
        userId,
        "",
      );

      expect(result).toEqual({
        type: "validation_error",
      });

      expect(UserService.getUserRegisterState).not.toHaveBeenCalled();
    });

    it("should return user_not_found if user registration is inconsistent", async () => {
      (UserService.getUserRegisterState as jest.Mock).mockResolvedValue({
        isNeonUser: true,
        isStreamUser: false,
      });

      const result: ChatSessionResponse = await ChatService.createChat(
        userId,
        message,
      );

      expect(result).toEqual({
        type: "user_not_found",
      });

      expect(createChatSession).not.toHaveBeenCalled();
    });

    it("should create a chat and process the first message successfully", async () => {
      const firstReply = "Hello Human!";

      (generateChatId as jest.Mock).mockReturnValue(chatId);

      (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
        firstReply,
      );

      (persistChatMessage as jest.Mock).mockResolvedValue({
        updatedAt,
      });

      const result: ChatSessionResponse = await ChatService.createChat(
        userId,
        message,
      );

      expect(generateChatId).toHaveBeenCalled();

      expect(createChatSession).toHaveBeenCalledWith(chatId, userId, message);

      expect(StreamChatService.getOrCreateChatChannel).toHaveBeenCalledWith(
        userId,
        chatId,
      );

      expect(geminiAiService.generateResponse).toHaveBeenCalledWith(
        message,
        [],
      );

      expect(StreamChatService.sendUserMessage).toHaveBeenCalledWith(
        userId,
        chatId,
        message,
      );

      expect(StreamChatService.sendAiMessage).toHaveBeenCalledWith(
        chatId,
        firstReply,
      );

      expect(persistChatMessage).toHaveBeenCalledWith(
        chatId,
        message,
        firstReply,
      );

      expect(ChatHistoryService.addMessageToHistory).toHaveBeenCalledWith(
        chatId,
        message,
        firstReply,
      );

      expect(result).toEqual({
        type: "success",
        chatId,
        updatedAt,
      });
    });

    it("should normalize whitespace when generating the chat title", async () => {
      const firstMessage = "  Hello    AI   from   my   chat  ";
      const firstReply = "Hello!";

      (generateChatId as jest.Mock).mockReturnValue(chatId);

      (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
        firstReply,
      );

      (persistChatMessage as jest.Mock).mockResolvedValue({
        updatedAt,
      });

      await ChatService.createChat(userId, firstMessage);

      expect(createChatSession).toHaveBeenCalledWith(
        chatId,
        userId,
        "Hello AI from my chat",
      );
    });

    it("should truncate chat titles longer than 25 characters", async () => {
      const firstMessage = "This is a very long message for a chat title";
      const firstReply = "Hello!";

      (generateChatId as jest.Mock).mockReturnValue(chatId);

      (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
        firstReply,
      );

      (persistChatMessage as jest.Mock).mockResolvedValue({
        updatedAt,
      });

      await ChatService.createChat(userId, firstMessage);

      expect(createChatSession).toHaveBeenCalledWith(
        chatId,
        userId,
        "This is a very long messa...",
      );
    });

    it("should return internal_error if createChat fails", async () => {
      (generateChatId as jest.Mock).mockReturnValue(chatId);

      (createChatSession as jest.Mock).mockRejectedValue(
        new Error("Database failure"),
      );

      const result: ChatSessionResponse = await ChatService.createChat(
        userId,
        message,
      );

      expect(result).toEqual({
        type: "internal_error",
      });
    });
  });

  // ============================================================
  // sendMessageToChatById
  // ============================================================

  describe("sendMessageToChatById", () => {
    it("should return validation_error if message, chatId, or userId is missing", async () => {
      const result: ChatResponse = await ChatService.sendMessageToChatById(
        "",
        chatId,
        userId,
      );

      expect(result).toEqual({
        type: "validation_error",
      });

      expect(UserService.getUserRegisterState).not.toHaveBeenCalled();
    });

    it("should return user_not_found if user registration is inconsistent", async () => {
      (UserService.getUserRegisterState as jest.Mock).mockResolvedValue({
        isNeonUser: true,
        isStreamUser: false,
      });

      const result: ChatResponse = await ChatService.sendMessageToChatById(
        message,
        chatId,
        userId,
      );

      expect(result).toEqual({
        type: "user_not_found",
      });

      expect(ChatHistoryService.getHistory).not.toHaveBeenCalled();
    });

    it("should successfully send a message to an existing chat", async () => {
      const mockHistory = [
        {
          message: "Hi",
          reply: "Hello",
        },
      ];

      const fullReply = "AI reply";

      (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue(
        mockHistory,
      );

      (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
        fullReply,
      );

      (persistChatMessage as jest.Mock).mockResolvedValue({
        updatedAt,
      });

      const result: ChatResponse = await ChatService.sendMessageToChatById(
        message,
        chatId,
        userId,
      );

      expect(ChatHistoryService.getHistory).toHaveBeenCalledWith(chatId);

      expect(geminiAiService.generateResponse).toHaveBeenCalledWith(message, [
        {
          role: "user",
          content: "Hi",
        },
        {
          role: "model",
          content: "Hello",
        },
      ]);

      expect(StreamChatService.sendUserMessage).toHaveBeenCalledWith(
        userId,
        chatId,
        message,
      );

      expect(StreamChatService.sendAiMessage).toHaveBeenCalledWith(
        chatId,
        fullReply,
      );

      expect(persistChatMessage).toHaveBeenCalledWith(
        chatId,
        message,
        fullReply,
      );

      expect(ChatHistoryService.addMessageToHistory).toHaveBeenCalledWith(
        chatId,
        message,
        fullReply,
      );

      expect(result).toEqual({
        type: "success",
        updatedAt,
        reply: fullReply,
      });
    });

    it("should return fresh response for the empty chat history", async () => {
      const fullReply = "Fresh reply";

      (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue([]);

      (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
        fullReply,
      );

      (persistChatMessage as jest.Mock).mockResolvedValue({
        updatedAt,
      });

      const result: ChatResponse = await ChatService.sendMessageToChatById(
        message,
        chatId,
        userId,
      );

      expect(geminiAiService.generateResponse).toHaveBeenCalledWith(
        message,
        [],
      );

      expect(result).toEqual({
        type: "success",
        updatedAt,
        reply: fullReply,
      });
    });

    it("should return internal_error if AI generation fails", async () => {
      (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue([]);

      (geminiAiService.generateResponse as jest.Mock).mockRejectedValue(
        new Error("AI failure"),
      );

      const result: ChatResponse = await ChatService.sendMessageToChatById(
        message,
        chatId,
        userId,
      );

      expect(result).toEqual({
        type: "internal_error",
      });

      expect(StreamChatService.sendUserMessage).not.toHaveBeenCalled();
      expect(persistChatMessage).not.toHaveBeenCalled();
    });

    it("should return internal_error if chat history retrieval fails", async () => {
      (ChatHistoryService.getHistory as jest.Mock).mockRejectedValue(
        new Error("History failure"),
      );

      const result: ChatResponse = await ChatService.sendMessageToChatById(
        message,
        chatId,
        userId,
      );

      expect(result).toEqual({
        type: "internal_error",
      });

      expect(geminiAiService.generateResponse).not.toHaveBeenCalled();
    });
  });
});
