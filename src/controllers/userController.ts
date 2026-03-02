import { Request, Response } from "express";
import { APIResponse, UserResponse } from "stream-chat";
import { getRedisClient } from "../services/redisService";
import generateUserId from "../utils/idGenerator";
import {
  StreamChatService
} from "../services/streamChatService";
import { getNeonUserById } from "../db/operations";
import { getUserChatHistory } from "./aiChatController";
import { validateAndNormalizeData } from "../utils/dataValidator";
import { AuthResult, AuthService } from "../services/authService";

const redisService = getRedisClient();

export async function registerUser(req: Request, res: Response): Promise<any> {
  const { name, email } = req.body;

  try {
    const validatedData = validateAndNormalizeData(name, email);

    if("error" in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    const authResult: AuthResult = await AuthService.authenticateOrRegister(name, validatedData.email);

    if(authResult.type === "cooldown") {
      return res.status(429).json({
        error: "Please wait before trying again"
      });
    }

    if (authResult.type === "already_registered") {
      return res.status(409).json({
        error: "User already registered.",
      });
    }

    if (authResult.type === "login") {
      return getUserChatHistory(req, res);
    }

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: authResult.user.id, name },
      token: authResult.token,
    });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function loginUser(req: Request, res: Response): Promise<any> {
  const { email, name } = req.body;

  try {
    const validatedData = validateAndNormalizeData(name, email);

    if ("error" in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    const userId = generateUserId(validatedData.email);
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    if(!existingNeonUser.length) return registerUser(req, res);

    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    if(!existingStreamUser.users.length) return registerUser(req, res);

    return res.status(200).json({
      message: "User login success.",
      user: { id: userId, name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}