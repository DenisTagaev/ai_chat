import { Request, Response } from "express";
import validator from "validator";
import { APIResponse, StreamChat, UserResponse } from "stream-chat";
import { getRedisClient } from "../services/redisService";
import generateUserId from "../utils/idGenerator";
import {
  checkRegisteredStreamUser,
  createStreamUser,
} from "../services/streamChatService";
import { createNeonUser, getNeonUserById } from "../db/operations";


// Init StreamChat client
const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

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
    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await checkRegisteredStreamUser(userId);
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    if (existingStreamUser.users.length || existingNeonUser.length) {
      return res.status(409).json({ error: "User already registered." });
    }

    //create new user in Stream Chat
    await createStreamUser({
      id: userId,
      email: sanitizedEmail,
      name,
      role: "user",
    });

    //create new user in cloud db and cache for 1 hour
    await createNeonUser(userId, name, sanitizedEmail);
    await redisService.set(
      `user:${sanitizedEmail}`,
      JSON.stringify({
        id: userId,
        email: sanitizedEmail,
        name,
        role: "user",
      }),
      { ex: 3600 }
    );

    // Generate StreamChat auth token
    const token: string = streamChatClient.createToken(userId);

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
