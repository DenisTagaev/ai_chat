import { createChatSession, saveStreamChatMessageToDB } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { ChatHistoryService } from "./chatHistoryService";
import { geminiAiService } from "./geminiAiService";
import { GeminiMessage } from "../utils/interfaces";
import { ChatResponse } from "../utils/types";
import { UserService } from "./userService";
import { logger } from "../utils/logger";
import { generateChatId } from "../utils/idGenerator";
export class ChatService {
  // ---- Create new chat with initial message ---- //
  static async createChat(userId: string, firstMessage: string) {
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

      const firstReply: string = await geminiAiService.generateResponse(firstMessage, []);
      await StreamChatService.sendMessageToAi(userId, chatId, firstReply);

      await saveStreamChatMessageToDB(chatId, firstMessage, firstReply);
      logger.info({ userId, chatId }, "chat.session.created");
      return { type: "success", chatId };
    } catch (error) {
      logger.error({ error }, "chat.session.creation_failed");
      return { type: "internal_error" };
    }
  }

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

    const chatHistory: {
      [x: string]: any;
    }[] = await ChatHistoryService.getHistory(chatId);

    const formattedHistory: GeminiMessage[] = chatHistory.flatMap((chunk) => [
      { role: "user", content: String(chunk.message) },
      { role: "model", content: String(chunk.reply) },
    ]);

    logger.debug({ message }, "chat.message.generation_start");
    const fullReply: string = await geminiAiService.generateResponse(
      message,
      formattedHistory,
    );
    logger.info("chat.ai_response.generated");

    // ---- send to stream ---- //
    await StreamChatService.sendMessageToAi(userId, chatId, fullReply);
    logger.debug("chat.stream.message_sent");

    // ---- persist ---- //
    await saveStreamChatMessageToDB(userId, chatId, message, fullReply);
    logger.debug("chat.db.message_saved");

    // --- clear cache --- //
    await ChatHistoryService.addMessageToHistory(
      userId,
      chatId,
      message,
      fullReply,
    );

    return { type: "success", reply: fullReply };
  }
}
