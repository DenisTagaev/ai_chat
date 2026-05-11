import { z } from "zod/v4";

// AI chat message validator
export const createChatSchema = z.object({
  body: z.object({
    userId: z.string().min(1).max(256),
    message: z.string().trim().min(1),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    chatId: z.string().min(1).max(256),
  }),
  body: z.object({
    userId: z.string().min(1).max(256),
    message: z.string().trim().min(1),
  }),
});

// Chat history request validator
export const chatHistorySchema = z.object({
  params: z.object({
    chatId: z.string().min(1).max(256),
  }),
});

export const userChatsSchema = z.object({
  query: z.object({
    userId: z.string().min(1).max(256),
  }),
});