import { ChatSelect } from "../db/schemas";
import { StreamUser } from "./interfaces";

export type AuthResult =
  | { type: "validation_error"; error: string }
  | { type: "cooldown" }
  | { type: "already_registered" }
  | { type: "login"; user: StreamUser; chatHistory: ChatSelect[] }
  | {
      type: "registered";
      user: StreamUser;
      token: string;
    };

export type ChatResponse =
  | { type: "validation_error" }
  | { type: "user_not_found" }
  | { type: "success"; reply: string };