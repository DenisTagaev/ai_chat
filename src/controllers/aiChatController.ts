import { Request, Response } from "express";
import { ChatService } from "../services/chatService";
import { ChatResponse, ChatSessionResponse, ChatSessionsListResponse } from "../utils/types";
import { ChatResultMapper } from "../middleware/chatResultMapper";
import { ChatHistoryService } from "../services/chatHistoryService";
import { ChatSelect } from "../db/schemas";
import { serializeError } from "../utils/errorSerializer";

// ------------------------------------------
// POST /ai-chats
// ------------------------------------------
export async function createChat(req: Request, res: Response): Promise<any> {
  const { message, userId } = req.body;

  try {
    const chatResponse: ChatSessionResponse = await ChatService.createChat(userId, message);
    return ChatResultMapper.toHttp(res, chatResponse);
  } catch (err: unknown) {
    req.log.error({ err: serializeError(err) }, "chat.create_request.failed:");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ------------------------------------------
// POST /ai-chats/:chatId
// ------------------------------------------
export async function sendMessage(req: Request, res: Response): Promise<any> {
  const { message, userId } = req.body;
  const { chatId } = req.params;

  try {
    const chatResponse: ChatResponse = await ChatService.sendMessageToChatById(message, chatId, userId);
    return ChatResultMapper.toHttp(res, chatResponse);
  } catch (err: unknown) {
    req.log.error({ err: serializeError(err) }, "chat.send_message.failed:");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
// ------------------------------------------

// ------------------------------------------
// GET /ai-chats/:chatId/history
// ------------------------------------------
export async function getChatHistory(
  req: Request,
  res: Response
): Promise<any> {
  const { chatId } = req.params;

  try {
    if (!chatId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const history: ChatSelect[] = await ChatHistoryService.getHistory(chatId);

    res.status(200).json({
      messages: history.map((item) => ({
        message: item.message,
        reply: item.reply,
      })),
    });
  } catch (err: unknown) {
    req.log.error({ err: serializeError(err) }, "chat.history_retrieve.failed:");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// ------------------------------------------
// GET /chats (list user chats)
// ------------------------------------------
export async function getUserChats(
  req: Request,
  res: Response
): Promise<any> {
  const { userId } = req.query;

  try {
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Missing userId" });
    }

    const chatResponse: ChatSessionsListResponse = await ChatService.getUserChats(userId);
    return ChatResultMapper.toHttp(res, chatResponse);
  } catch (err: unknown) {
    req.log.error({ err: serializeError(err), userId }, "chat.list_user_chats.failed:");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}