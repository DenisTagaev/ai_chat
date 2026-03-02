import { APIResponse, UserResponse } from "stream-chat";
import generateUserId from "../utils/idGenerator";
import { StreamChatService } from "./streamChatService";
import { createNeonUser, getNeonUserById } from "../db/operations";
import { StreamUser } from "../utils/interfaces";
import { getRedisClient } from "./redisService";
import { validateAndNormalizeData } from "../utils/dataValidator";
import { AuthResult } from "../utils/types";
import { ChatHistoryService } from "./chatHistoryService";

const redis = getRedisClient();

export class AuthService {
  static async authenticateOrRegister(
    name: string,
    email: string,
  ): Promise<AuthResult> {
    const validatedData:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData(name, email);

    if("error" in validatedData) {
      return { type: "validation_error", error: validatedData.error }
    }

    const normalizedEmail: string = validatedData.email;
    const userId: string = generateUserId(normalizedEmail);

    const user: StreamUser = {
      id: userId,
      email: normalizedEmail,
      name,
      role: "user",
    };

    // ---- cooldown protection ----
    const cooldownKey: string = `register:${normalizedEmail}`;
    const recentAttempt: Record<string, any> | null = await redis.get(cooldownKey);

    if (recentAttempt) {
      return { type: "cooldown" };
    }

    await redis.set(cooldownKey, user, { ex: 10 });

    // ---- DB checks ----
    const existingNeonUser: { [x: string]: any }[] =
      await getNeonUserById(userId);

    const existingStreamUser: APIResponse & {
      users: Array<UserResponse>;
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    // fully registered → login
    if (existingNeonUser.length && existingStreamUser.users.length) {
      const chatHistory = await ChatHistoryService.getHistory(userId);
      return { type: "login", user, chatHistory };
    }

    // partial mismatch safety
    if (existingNeonUser.length || existingStreamUser.users.length) {
      return { type: "already_registered" };
    }

    // ---- create new user ----
    await StreamChatService.createStreamUser(user);
    await createNeonUser(userId, name, normalizedEmail);

    await redis.set(`user:${normalizedEmail}`, user, { ex: 3600 });

    const token: string = StreamChatService.generateStreamUserToken(userId);

    return {
      type: "registered",
      user,
      token,
    };
  }
}
