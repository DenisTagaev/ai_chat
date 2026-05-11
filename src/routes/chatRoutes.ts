import { Router } from "express";
import { createChat, getChatHistory, getUserChats, sendMessage } from "../controllers/aiChatController";
import { validate } from "../middleware/zodValidator";
import {
  chatHistorySchema,
  createChatSchema,
  sendMessageSchema,
  userChatsSchema,
} from "../db/validators/zodChatSchemas";

const router: Router = Router();

router.get("/chats", validate(userChatsSchema), getUserChats);

router.get("/chats/:chatId/history", validate(chatHistorySchema), getChatHistory);

router.post("/chats", validate(createChatSchema), createChat);

router.post("/chats/:chatId", validate(sendMessageSchema), sendMessage);

export default router;
