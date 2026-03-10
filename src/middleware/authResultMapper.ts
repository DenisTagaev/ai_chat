import { Response } from "express";
import { AuthResult } from "../utils/types";

export class AuthResultMapper {
  static toHttpResponse(result: AuthResult, res: Response) {
    switch (result.type) {
      case "validation_error":
        return res.status(400).json({
          error: result.error,
        });

      case "cooldown":
        return res.status(429).json({
          error: "Please wait before trying again.",
        });

      case "already_registered":
        return res.status(409).json({
          error: "User already registered.",
        });

      case "login":
        return res.status(200).json({
          message: "User login success.",
          user: result.user,
          chatHistory: result.chatHistory
        });

      case "registered":
        return res.status(201).json({
          message: "User registered successfully.",
          user: result.user,
        });
    }
  }
}
