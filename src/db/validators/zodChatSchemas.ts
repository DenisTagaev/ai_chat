import { z } from "zod/v4";

// AI chat message validator
export const aiChatSchema = z.object({
  body: z.object({
    userId: z.string().min(1).max(256),
    message: z.string().min(1),
  }),
});

// Chat history request validator
export const chatHistorySchema = z.object({
  body: z.object({
    userId: z.string().min(1).max(256),
  }),
});