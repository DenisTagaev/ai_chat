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
    };

export type BaseChatResponse =
  | { type: "validation_error" }
  | { type: "user_not_found" }
  | { type: "internal_error" };

export type ChatResponse =
  | BaseChatResponse
  | { type: "success"; reply: string };

export type ChatSessionResponse =
  | BaseChatResponse
  | { type: "success"; chatId: string };

export type ChatSessionsListResponse =
  | BaseChatResponse
  | { type: "success"; chats: ChatSelect[] };

export type UserRegistrationState = {
  isNeonUser: boolean;
  isStreamUser: boolean;
};

  export type RequestContext = {
    reqId: string;
    userId?: string | null;
  };