import express, { Request, response, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import validator from "validator";
import { createClient } from "redis";
import { APIResponse, StreamChat, UserResponse } from "stream-chat";
import generateUserId from "./utils/idGenerator.js";
import { checkRegisteredStreamUser, createAiChatChannel, createStreamUser, sendMessageToAi } from "./services/streamChatService.js";
import { createNeonUser, getNeonUserById, getStreamChatHistoryFromDB, saveStreamChatMessageToDB } from "./db/operations.js";
import { ChatSelect } from "./db/schemas.js";
import { getAiChatResponse } from "./services/openAiService.js";

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
      //create new user in cloud db
      await createNeonUser(userId, name, email);
      await redisClient.setEx(
        `user:${sanitizedEmail}`,
        3600,
        JSON.stringify({
          id: userId,
          email: sanitizedEmail,
          name,
          role: "user",
        })
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

      const existingStreamUser: APIResponse & {
          users: Array<UserResponse>;
        } = await checkRegisteredStreamUser(userId);
      const existingNeonUser: {
        [x: string]: any;
      }[] = await getNeonUserById(userId);

      if (!existingStreamUser.users.length || !existingNeonUser.length) {
        return res.status(404).json({ error: "user not found" });
      } 

      //on success send message to OpenAI
      const aiMessage: string = await getAiChatResponse(message);

      //open channel with ai
      const channel = await createAiChatChannel(userId);
      await sendMessageToAi(channel, aiMessage);

      //save messages to the neondb and clear cache
      await saveStreamChatMessageToDB(userId, message, aiMessage);
      await redisClient.del(`chat_history:${userId}`);

      res.status(200).json({ reply: aiMessage });
    } catch (error: any) {
      console.error("Connection Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post(
  "/chat-history",
  async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body; 
  
  try{
    if (!userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const recentAttemptKey: string = `chat_history:${userId}`;
    const cachedData: string | null = await redisClient.get(recentAttemptKey);

    //check for chat in cache
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as ChatSelect[];
      } catch {
        // If cache is corrupt, delete and refetch from DB
        await redisClient.del(recentAttemptKey);
      }
    }

    const chatHistory: {
      [x: string]: any;
    } = await getStreamChatHistoryFromDB(userId);

    // Cache result for 10 minutes
    if (chatHistory.length > 0) {
      await redisClient.setEx(
        recentAttemptKey,
        600,
        JSON.stringify(chatHistory)
      );
    }

    res.status(200).json({ messages: chatHistory });
  } catch(error: any){
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

