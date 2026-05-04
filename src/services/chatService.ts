import { createChatSession, saveStreamChatMessageToDB } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { ChatHistoryService } from "./chatHistoryService";
import { geminiAiService } from "./geminiAiService";
import { GeminiMessage } from "../utils/interfaces";
import { ChatResponse, ChatSessionResponse } from "../utils/types";
import { UserService } from "./userService";
import { logger } from "../utils/logger";
import { generateChatId } from "../utils/idGenerator";
export class ChatService {
  // ---- Create new chat with initial message ---- //
  static async createChat(
    userId: string,
    firstMessage: string
  ): Promise<ChatSessionResponse> {
    if (!userId || !firstMessage.trim()) {
      return { type: "validation_error" };
    }

    // ---- verify user exists ---- //
    const registrationState: string =
      await UserService.getUserRegisterState(userId);

    if (registrationState === "inconsistent_registration") {
      logger.debug("chat.registration.inconsistent");
      return { type: "user_not_found" };
    }

    const chatId: string = generateChatId();

    try {
      await createChatSession(chatId, userId, "New Chat");
      await StreamChatService.getOrCreateChatChannel(userId, chatId);

      const firstReply: string = await geminiAiService.generateResponse(
        firstMessage,
        [],
      );
      await StreamChatService.sendUserMessage(userId, chatId, firstMessage);
      logger.debug({ chatId }, "chat.stream.message_sent");
      await StreamChatService.sendAiMessage(chatId, firstReply);
      logger.debug({ chatId }, "chat.stream.message_sent");

      await ChatHistoryService.addMessageToHistory(
        chatId,
        firstMessage,
        firstReply,
      );

      logger.info({ userId, chatId }, "chat.session.created");
      return { type: "success", chatId };
    } catch (error) {
      logger.error({ error }, "chat.session.creation_failed");
      return { type: "internal_error" };
    }
  }

  // ---- Send message to existing chat ---- //
  static async sendMessageToChatById(
    message: string,
    chatId: string,
    userId: string,
  ): Promise<ChatResponse> {
    if (!message || !userId || !chatId) {
      return { type: "validation_error" };
    }

    // ---- verify user exists ---- //
    const registrationState: string =
      await UserService.getUserRegisterState(userId);

    if (registrationState === "inconsistent_registration") {
      logger.debug("chat.registration.inconsistent");
      return { type: "user_not_found" };
    }

    try {
      const chatHistory: {
        [x: string]: any;
      }[] = await ChatHistoryService.getHistory(chatId);

      const formattedHistory: GeminiMessage[] = chatHistory.flatMap((chunk) => [
        { role: "user", content: String(chunk.message) },
        { role: "model", content: String(chunk.reply) },
      ]);

      logger.debug({ chatId, message }, "chat.message.generation_start");

      // ---- generate AI response ---- //
      const fullReply: string = await geminiAiService.generateResponse(
        message,
        formattedHistory,
      );

      logger.info({ chatId }, "chat.ai_response.generated");

      // ---- send to stream ---- //
      await StreamChatService.sendUserMessage(userId, chatId, message);
      logger.debug({ chatId }, "chat.stream.message_sent");
      await StreamChatService.sendAiMessage(chatId, fullReply);
      logger.debug({ chatId }, "chat.stream.message_sent");

      // ---- persist ---- //
      await saveStreamChatMessageToDB(chatId, message, fullReply);
      logger.debug({ chatId }, "chat.db.message_saved");

      // --- clear cache --- //
      await ChatHistoryService.addMessageToHistory(chatId, message, fullReply);

      return { type: "success", reply: fullReply };
    } catch (error) {
      logger.error({ chatId, error }, "chat.message.generation_failed");
      return { type: "internal_error" };
    }
  }
}
