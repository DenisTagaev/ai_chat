import { saveStreamChatMessageToDB } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { ChatHistoryService } from "./chatHistoryService";
import { geminiAiService } from "./geminiAiService";
import { GeminiMessage } from "../utils/interfaces";
import { ChatResponse } from "../utils/types";
import { UserService } from "./userService";
import { logger } from "../utils/logger";

export class ChatService {
  static async interactWithChat(
    message: string,
    userId: string,
  ): Promise<ChatResponse> {
    if (!message || !userId) {
      return { type: "validation_error" };
    }

    // ---- verify user exists ---- //
    const registrationState: string =
      await UserService.getUserRegisterState(userId);

    if(registrationState === "inconsistent_registration") {
      logger.debug({ userId }, "Missing user chat");
      return { type: "user_not_found"}
    }

    const chatHistory: {
      [x: string]: any;
    }[] = await ChatHistoryService.getHistory(userId);

    const formattedHistory: GeminiMessage[] = chatHistory.flatMap((chunk) => [
      { role: "user", content: String(chunk.message) },
      { role: "model", content: String(chunk.reply) },
    ]);

    logger.debug({ userId, message }, "Generating AI response");
    const fullReply: string = await geminiAiService.generateResponse(
      message,
      formattedHistory,
    );
    logger.info({ userId }, "Generated AI response");

    // ---- send to stream ---- //
    await StreamChatService.sendMessageToAi(userId, fullReply);
    logger.debug({ userId }, "Sending message to Stream");

    // ---- persist ---- //
    await saveStreamChatMessageToDB(userId, message, fullReply);
    logger.debug({ userId }, "Saving message to DB");

    // --- clear cache --- //
    await ChatHistoryService.addMessageToHistory(userId, message, fullReply);

    return { type: "success", reply: fullReply };
  }
}
