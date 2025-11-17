import { Router } from "express";
import {
  getUserChatHistory,
  handleAiChat,
} from "../controllers/aiChatController";
import { validate } from "../middleware/zodValidator";
import {
  aiChatSchema,
  chatHistorySchema,
} from "../db/validators/zodChatSchemas";

const router: Router = Router();

router.post("/chat-history", validate(chatHistorySchema), getUserChatHistory);

router.post("/chat", validate(aiChatSchema), handleAiChat);

export default router;
