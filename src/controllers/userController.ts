import { Request, Response } from "express";
import validator from "validator";
import { APIResponse, UserResponse } from "stream-chat";
import { getRedisClient } from "../services/redisService";
import generateUserId from "../utils/idGenerator";
import {
  StreamChatService
} from "../services/streamChatService";
import { createNeonUser, getNeonUserById } from "../db/operations";
import { getUserChatHistory } from "./aiChatController";

const redisService = getRedisClient();

export async function registerUser(req: Request, res: Response): Promise<any> {
  const { name, email } = req.body;

  try {
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.length > 50
    ) {
      return res.status(400).json({ error: "Invalid name format." });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    const sanitizedEmail: string | false = validator.normalizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Rate limit per email for cooldown
    const recentAttemptKey: string = `register:${sanitizedEmail}`;
    const recentAttempt: string | null = await redisService.get(
      recentAttemptKey
    );

    if (recentAttempt) {
      return res.status(429).json({
        error: "Please wait before trying again.",
      });
    }

    await redisService.set(recentAttemptKey, "1", { ex: 10 });

    const userId: string = generateUserId(sanitizedEmail);

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
    await StreamChatService.createStreamUser({
      id: userId,
      email: sanitizedEmail,
      name,
      role: "user",
    });

    //create new user in cloud db and cache for 1 hour
    await createNeonUser(userId, name, sanitizedEmail);
    await redisService.set(
      `user:${sanitizedEmail}`,{
        id: userId,
        email: sanitizedEmail,
        name,
        role: "user",
      },
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

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const sanitizedEmail = validator.normalizeEmail(email);
  if (!sanitizedEmail) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const userId = generateUserId(sanitizedEmail);

  try {
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