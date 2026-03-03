import { Request, Response } from "express";
import { ChatService } from "../services/chatService";
import { ChatResponse } from "../utils/types";
import { ChatResultMapper } from "../middleware/chatResultMapper";
import { ChatHistoryService } from "../services/chatHistoryService";

// ------------------------------------------
// POST /ai-chat
// ------------------------------------------
export async function handleAiChat(req: Request, res: Response): Promise<any> {
  try {
    const { message, userId } = req.body;
    const chatResponse: ChatResponse = await ChatService.handleAiChat(message, userId);

    return ChatResultMapper.toHttp(res, chatResponse);
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
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const history: {
      [x: string]: any;
    }[] = await ChatHistoryService.getHistory(userId);

    return res.status(200).json({ history });
  } catch (err: any) {
    console.error("Chat History Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
