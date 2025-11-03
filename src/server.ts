import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import validator from "validator";
import { createClient } from "redis";
import { APIResponse, StreamChat, UserResponse } from "stream-chat";
import { StreamUser } from "./utils/interfaces.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: false}));

const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // limit each IP to 5 registration attempts per minute
  message: "Too many registration attempts. Please try again later.",
});

app.post(
    '/user-register',
    registerLimiter,
    async(req: Request, res: Response): Promise<any> => {
    
    try {
      const { name, email } = req.body;

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

      //sanitaze user input
      const sanitizedEmail: string | false = validator.normalizeEmail(email)!;

      if(!sanitizedEmail) {
        return res.status(400).json({ error: "Invalid email format." });
      }
      //rate-limit attempts
      const recentAttemptKey: string = `register:${sanitizedEmail}`;
      const recentAttempt: string | null = await redisClient.get(recentAttemptKey);

      if (recentAttempt) {
        return res
          .status(429)
          .json({ error: "Please wait before trying again." });
      }
      // store cooldown to prevent repeated registration
      await redisClient.setEx(recentAttemptKey, 10, "1");

      const existingUser: APIResponse & {
        users: Array<UserResponse>;
      } = await streamChatClient.queryUsers({
        id: sanitizedEmail,
      });

      if (existingUser.users.length > 0) {
        return res.status(409).json({ error: "User already registered." });
      }

      //create new user in Stream Chat
      const user: StreamUser = {
        id: sanitizedEmail,
        name,
        role: "user",
      };

      await streamChatClient.upsertUser(user as UserResponse);
      await redisClient.setEx(
        `user:${sanitizedEmail}`,
        3600,
        JSON.stringify(user)
      );
      //respond with success
        const token: string = streamChatClient.createToken(sanitizedEmail);
        return res.status(201).json({
            message: "User registered successfully.",
            user,
            token,
        });

    } catch (error: any) {
      console.error("Registration Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
})

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

