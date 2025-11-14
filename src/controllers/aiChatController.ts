import { Request, Response } from "express";

import {
  checkRegisteredStreamUser,
  createAiChatChannel,
  sendMessageToAi,
} from "../services/streamChatService.js";
import {
  getNeonUserById,
  getStreamChatHistoryFromDB,
  saveStreamChatMessageToDB,
} from "../db/operations.js";
import { getAiChatResponse } from "../services/openAiService.js";
import { redisService } from "../services/redisService.js";
import { ChatSelect } from "../db/schemas.js";
import { APIResponse, Channel, UserResponse } from "stream-chat";


// ------------------------------------------
// POST /ai-chat
// ------------------------------------------
export async function handleAiChat(req: Request, res: Response): Promise<any> {
  const { message, userId } = req.body;

  try {
    if (!message || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await checkRegisteredStreamUser(userId);
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    if (!existingStreamUser.users.length || !existingNeonUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    //on success send message to OpenAI
    const aiMessage: string = await getAiChatResponse(message);

    // Open AI chat channel
    const channel: Channel = await createAiChatChannel(userId);
    await sendMessageToAi(channel, aiMessage);

    // Save messages in Neon DB and clear cache
    await saveStreamChatMessageToDB(userId, message, aiMessage);
    await redisService.del(`chat_history:${userId}`);
    
    return res.status(200).json({ reply: aiMessage });
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
    const cachedData: string | null = await redisService.get(recentAttemptKey);


    // Serve from cache when possible
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData) as ChatSelect[];
        return res.status(200).json({ messages: parsed });
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
      await redisService.set(recentAttemptKey, JSON.stringify(chatHistory), { ex: 600 });
    }

    return res.status(200).json({ messages: chatHistory });
  } catch (err: any) {
    console.error("Chat History Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
