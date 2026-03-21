import { Response } from "express";
import { ChatResponse } from "../utils/types";

export class ChatResultMapper {
  static toHttp(
    res: Response,
    result: ChatResponse,
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

      case "success":
        return res.status(200).json({
          reply: result.reply,
        });
      default:
        return res.status(500).json({
          error: "Unknown chat result type",
        });
    }
  }
}
