import { Request, Response } from "express";

import {
  StreamChatService
} from "../services/streamChatService";
import {
  getNeonUserById,
  getStreamChatHistoryFromDB,
  saveStreamChatMessageToDB,
} from "../db/operations";
import { geminiAiService } from "../services/geminiAiService";
import { getRedisClient } from "../services/redisService";
import { ChatSelect } from "../db/schemas";
import { APIResponse, Channel, UserResponse } from "stream-chat";
import { GeminiMessage } from "../utils/interfaces";

const redisService = getRedisClient();

// ------------------------------------------
// POST /ai-chat
// ------------------------------------------
export async function handleAiChat(req: Request, res: Response): Promise<any> {
  const { message, userId } = req.body;

  try {
    if (!message || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    if (!existingNeonUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    if (!existingStreamUser.users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const cacheKey: string = `chat_history:${userId}`;
    let chatHistory = await redisService.get<ChatSelect[]>(cacheKey);

    if(!chatHistory || !Array.isArray(chatHistory)) {
      chatHistory = await getStreamChatHistoryFromDB(userId);

      if(chatHistory.length > 0) {
        await redisService.set(cacheKey, chatHistory, { ex: 600 });
      }
    }

    const formattedHistory: GeminiMessage[] = chatHistory.flatMap(
      (chunk) => [
        { role: "user" as const, content: String(chunk.message) },
        { role: "model" as const, content: String(chunk.reply) },
      ]
    )

    // Gemini AI chat channel
    const fullReply: string = await geminiAiService.generateResponse(message, formattedHistory);
    const channel: Channel = await StreamChatService.createAiChatChannel(userId);
    await StreamChatService.sendMessageToAi(channel, fullReply);

    // Save messages in Neon DB and clear cache
    await saveStreamChatMessageToDB(userId, message, fullReply);
    await redisService.del(cacheKey);

    return res.status(200).json({
      reply: fullReply
    });
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ------------------------------------------
// POST /chat-history
// ------------------------------------------
export async function getUserChatHistory(
  req: Request,
  res: Response
): Promise<any> {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recentAttemptKey: string = `chat_history:${userId}`;
    const cachedData = await redisService.get<ChatSelect[]>(recentAttemptKey);


    // Serve from cache when possible
    if (cachedData && Array.isArray(cachedData)) {
      try {
        return res.status(200).json({ messages: cachedData });
      } catch (err) {
        // If cache is corrupt, delete and refetch from DB
        console.error(err);
        await redisService.del(recentAttemptKey);
      }
    }

    const chatHistory: {
      [x: string]: any;
    } = await getStreamChatHistoryFromDB(userId);

    // Cache only non-empty history
    if (chatHistory.length > 0) {
      await redisService.set(recentAttemptKey, chatHistory, { ex: 600 });
    }

    return res.status(200).json({ messages: chatHistory });
  } catch (err: any) {
    console.error("Chat History Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
