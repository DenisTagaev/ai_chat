jest.mock("../../db/operations", () => ({
  saveStreamChatMessageToDB: jest.fn(),
}));

jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    sendMessageToAi: jest.fn(),
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

import { ChatService } from "../../services/chatService";
import { saveStreamChatMessageToDB } from "../../db/operations";
import { StreamChatService } from "../../services/streamChatService";
import { ChatHistoryService } from "../../services/chatHistoryService";
import { geminiAiService } from "../../services/geminiAiService";
import { UserService } from "../../services/userService";
import { ChatResponse } from "../../utils/types";

describe("ChatService", () => {
  const userId: string = "user-123";
  const message: string = "Hello AI";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // validation error
  // -----------------------------
  it("should return validation_error if message or userId is missing", async () => {
    const chatResponse: ChatResponse = await ChatService.interactWithChat("", userId);

    expect(chatResponse).toEqual({ type: "validation_error" });
  });

  // -----------------------------
  // user not found
  // -----------------------------
  it("should return user_not_found if user state is inconsistent", async () => {
    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "inconsistent_registration",
    );

    const chatResponse: ChatResponse = await ChatService.interactWithChat(message, userId);

    expect(chatResponse).toEqual({ type: "user_not_found" });
  });

  // -----------------------------
  // success path
  // -----------------------------
  it("should successfully interact with chat", async () => {
    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "fully_registered",
    );

    const mockHistory: {
      [x: string]: any;
    }[] = [{ message: "Hi", reply: "Hello" }];

    (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue(mockHistory);
    (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
      "AI reply",
    );

    (StreamChatService.sendMessageToAi as jest.Mock).mockResolvedValue({});
    (saveStreamChatMessageToDB as jest.Mock).mockResolvedValue({});
    (ChatHistoryService.addMessageToHistory as jest.Mock).mockResolvedValue(
      undefined,
    );

    const chatResponse: ChatResponse = await ChatService.interactWithChat(message, userId);

    expect(chatResponse).toEqual({
      type: "success",
      reply: "AI reply",
    });
    expect(geminiAiService.generateResponse).toHaveBeenCalledWith(message, [
      { role: "user", content: "Hi" },
      { role: "model", content: "Hello" },
    ]);
    expect(StreamChatService.sendMessageToAi).toHaveBeenCalledWith(
      userId,
      "AI reply",
    );
    expect(saveStreamChatMessageToDB).toHaveBeenCalledWith(
      userId,
      message,
      "AI reply",
    );
    expect(ChatHistoryService.addMessageToHistory).toHaveBeenCalledWith(
      userId,
      message,
      "AI reply",
    );
  });

  // -----------------------------
  // empty history edge case
  // -----------------------------
  it("should successfully work with empty chat history", async () => {
    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "fully_registered",
    );

    (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue([]);
    (geminiAiService.generateResponse as jest.Mock).mockResolvedValue(
      "Fresh reply",
    );

    const chatResponse: ChatResponse = await ChatService.interactWithChat(message, userId);

    expect(geminiAiService.generateResponse).toHaveBeenCalledWith(
      message,
      [],
    );

    expect(chatResponse).toEqual({
      type: "success",
      reply: "Fresh reply",
    });
  });

  // -----------------------------
  // AI or server error
  // -----------------------------
  it("should throw if AI service fails", async () => {
    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "fully_registered",
    );
    (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue([]);
    (geminiAiService.generateResponse as jest.Mock).mockRejectedValue(
      new Error("AI failure"),
    );

    await expect(ChatService.interactWithChat(message, userId)).rejects.toThrow(
      "AI failure",
    );
  });
});
