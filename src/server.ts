import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import validator from "validator";
import OpenAI from "openai";
import { createClient } from "redis";
import { APIResponse, StreamChat, UserResponse } from "stream-chat";
import { StreamUser } from "./utils/interfaces.js";
import generateUserId from "./utils/idGenerator.js";
import { error } from "console";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: false}));

//** Streamchat API related content */
const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // limit each IP to 5 registration attempts per minute
  message: "Too many registration attempts. Please try again later.",
});
//**--> End of Streamchat API content */

//** OpenAI API related content */
const openAiClient: OpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
//**--> End of OpenAI API content */

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

      const userId: string = generateUserId(sanitizedEmail);
      const existingUser: APIResponse & {
        users: Array<UserResponse>;
      } = await streamChatClient.queryUsers({
        id: { $eq: userId },
      });

      if (existingUser.users.length > 0) {
        return res.status(409).json({ error: "User already registered." });
      }

      //create new user in Stream Chat
      const newUser: StreamUser = {
        id: userId,
        email: sanitizedEmail,
        name,
        role: "user",
      };

      await streamChatClient.upsertUser(newUser as UserResponse);
      await redisClient.setEx(
        `user:${sanitizedEmail}`,
        3600,
        JSON.stringify(newUser)
      );
      //respond with success
      const token: string = streamChatClient.createToken(userId);
      return res.status(201).json({
          message: "User registered successfully.",
          user: { id: userId, name},
          token,
      });

    } catch (error: any) {
      console.error("Registration Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post('/ai-chat', 
  async(req: Request, res: Response): Promise<any>=> {
    const { message, userId } = req.body;

    try {
      if (!message || !userId) {
        return res
          .status(400)
          .json({ error: "Missing required fields" });
      }

      const user: APIResponse & {
        users: Array<UserResponse>;
      } = await streamChatClient.queryUsers({
        id: { $eq: userId },
      });

      if(!user.users.length){
        return res
          .status(404)
          .json({ error: 'user not found'})
      } 

    } catch (error: any) {
      console.error("Connection Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

