import { z } from "zod/v4";

// AI chat user validator
export const AuthUserSchema = z.object({
  body: z.object({
    email: z.email(),
    name: z.string().min(1).max(64),
  }),
});
