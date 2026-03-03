import { getNeonUserById, saveStreamChatMessageToDB } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { ChatHistoryService } from "./chatHistoryService";
import { geminiAiService } from "./geminiAiService";
import { GeminiMessage } from "../utils/interfaces";
import { ChatResponse } from "../utils/types";
import { APIResponse, Channel, UserResponse } from "stream-chat";

export class ChatService {
  static async handleAiChat(
    message: string,
    userId: string,
  ): Promise<ChatResponse> {
    if (!message || !userId) {
      return { type: "validation_error" };
    }

    // ---- verify user exists ---- //
    const neonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);
    if (!neonUser.length) {
      return { type: "user_not_found" };
    }

    const streamUser: APIResponse & {
      users: UserResponse[];
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    if (!streamUser.users.length) {
      return { type: "user_not_found" };
    }

    const chatHistory: {
      [x: string]: any;
    }[] = await ChatHistoryService.getHistory(userId);

    const formattedHistory: GeminiMessage[] = chatHistory.flatMap((chunk) => [
      { role: "user", content: String(chunk.message) },
      { role: "model", content: String(chunk.reply) },
    ]);

    const fullReply: string = await geminiAiService.generateResponse(
      message,
      formattedHistory,
    );

    // ---- send to stream ---- //
    const channel: Channel = await StreamChatService.createAiChatChannel(userId);
    await StreamChatService.sendMessageToAi(channel, fullReply);

    // ---- persist ---- //
    await saveStreamChatMessageToDB(userId, message, fullReply);

    // --- clear cache --- //
    await ChatHistoryService.invalidateHistory(userId);

    return { type: "success", reply: fullReply };
  }
}
