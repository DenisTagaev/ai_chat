import { Response } from "express";
import {
  ChatResponse,
  ChatSessionResponse,
  ChatSessionsListResponse
} from "../utils/types";

type ChatResult = ChatResponse | ChatSessionResponse | ChatSessionsListResponse;

export class ChatResultMapper {
  static toHttp(
    res: Response,
    result: ChatResult,
  ): Response<any, Record<string, any>> {
    switch (result.type) {
      case "validation_error":
        return res.status(400).json({
          error: "Missing required fields",
        });

      case "user_not_found":
        return res.status(404).json({
          error: "User not found",
        });

      case "internal_error":
        return res.status(500).json({
          error: "Internal Server Error",
        });

      case "success":
        if ("chatId" in result) {
          return res.status(201).json({
            chatId: result.chatId,
          });
        }

        if ("chats" in result) {
          return res.status(200).json({
            chats: result.chats,
          });
        }

        if ("reply" in result) {
          return res.status(200).json({
            reply: result.reply,
            updatedAt: "updatedAt" in result ? result.updatedAt : undefined,
          });
        }

        return res.status(500).json({
          error: "Unknown success result",
        });

      default:
        return res.status(500).json({
          error: "Unknown chat result type",
        });
    }
  }
}
