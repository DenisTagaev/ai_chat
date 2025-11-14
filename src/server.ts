import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { registerUser } from "./controllers/userController.js";
import { getUserChatHistory, handleAiChat } from "./controllers/aiChatController.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: false}));

const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // limit each IP to 5 registration attempts per minute
  message: "Too many registration attempts. Please try again later.",
});
//**--> End of Streamchat API content */

app.post(
    '/user-register',
    registerLimiter,
    registerUser
)

app.post('/ai-chat', handleAiChat);

app.post("/chat-history", getUserChatHistory);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

