import { Request, Response } from "express";
import { APIResponse, UserResponse } from "stream-chat";
import { getRedisClient } from "../services/redisService";
import generateUserId from "../utils/idGenerator";
import {
  StreamChatService
} from "../services/streamChatService";
import { createNeonUser, getNeonUserById } from "../db/operations";
import { getUserChatHistory } from "./aiChatController";
import { validateAndNormalizeData } from "../utils/dataValidator";
import { StreamUser } from "../utils/interfaces";

const redisService = getRedisClient();

export async function registerUser(req: Request, res: Response): Promise<any> {
  const { name, email } = req.body;

  try {
    const validatedData = validateAndNormalizeData(name, email);

    if("error" in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    const sanitizedEmail: string = validatedData.email;

    // Rate limit per email for cooldown
    const recentAttemptKey: string = `register:${sanitizedEmail}`;
    const recentAttempt: Record<string, any> | null = await redisService.get(
      recentAttemptKey
    );

    if (recentAttempt) {
      return res.status(429).json({
        error: "Please wait before trying again.",
      });
    }

    const userId: string = generateUserId(sanitizedEmail);
    const user: StreamUser = {
      id: userId,
      email: sanitizedEmail,
      name,
      role: "user"
    }

    await redisService.set(recentAttemptKey, user, { ex: 10 });
    // Check StreamChat + NeonDB
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    if (existingNeonUser.length) {
      return res.status(409).json({ error: "User already registered." });
    }

    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    if (existingNeonUser.length && existingStreamUser.users.length) {
      // already fully registered → behave like login
      return getUserChatHistory(req, res);
    }

    if (existingStreamUser.users.length) {
      return res.status(409).json({ error: "User already registered." });
    }

    //create new user in Stream Chat
    await StreamChatService.createStreamUser(user);

    //create new user in cloud db and cache for 1 hour
    await createNeonUser(userId, name, sanitizedEmail);
    await redisService.set(
      `user:${sanitizedEmail}`,
      user,
      { ex: 3600 }
    );

    // Generate StreamChat auth token
    const token: string = StreamChatService.generateStreamUserToken(userId);

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: userId, name },
      token,
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