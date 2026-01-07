import { Request, Response } from "express";

import {
  checkRegisteredStreamUser,
  createAiChatChannel,
  sendMessageToAi,
} from "../services/streamChatService";
import {
  getNeonUserById,
  getStreamChatHistoryFromDB,
  saveStreamChatMessageToDB,
} from "../db/operations";
import { geminiAiService, GeminiStream } from "../services/geminiAiService";
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
    } = await checkRegisteredStreamUser(userId);

    if (!existingStreamUser.users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    //on success send message to GeminiAI in stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const formattedHistory: GeminiMessage[] = 
      await getStreamChatHistoryFromDB(userId)
        .then((r) => r.flatMap((chunk) => [
          { role: "user" as const, content: String(chunk.message)},
          { role: "model" as const, content: String(chunk.reply)}
        ]));
    const aiMessageStream: GeminiStream<string> = await geminiAiService.streamResponse(message, formattedHistory);

    let fullReply: string = "";

    for await (const chunk of aiMessageStream) {
      fullReply += chunk;
      res.write(`data: ${chunk}\n\n`);
    }

    res.write("data: [STREAM_DONE]\n\n");

    // Gemini AI chat channel
    const channel: Channel = await createAiChatChannel(userId);
    await sendMessageToAi(channel, fullReply);

    // Save messages in Neon DB and clear cache
    await saveStreamChatMessageToDB(userId, message, fullReply);
    await redisService.del(`chat_history:${userId}`);
    
    return res.end();
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.write(`data: [ERROR]\n\n`);
    return res.end();
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
