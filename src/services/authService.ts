import generateUserId from "../utils/idGenerator";
import { StreamChatService } from "./streamChatService";
import { createNeonUser } from "../db/operations";
import { StreamUser } from "../utils/interfaces";
import { getRedisClient } from "./redisService";
import { validateAndNormalizeData } from "../utils/dataValidator";
import { AuthResult } from "../utils/types";
import { ChatHistoryService } from "./chatHistoryService";
import { UserService } from "./userService";

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
    const registrationState: string = await UserService.getUserRegisterState(userId);

    switch (registrationState) {
      case "fully_registered":
        return { type: "registered", user };

      case "inconsistent":
        return { type: "already_registered" };

      case "not_registered":
        break; // continue to registration
    }

    // ---- create new user ----
    await StreamChatService.createStreamUser(user);
    await createNeonUser(userId, name, normalizedEmail);
    await StreamChatService.createAiChatChannel(userId);

    await redis.set(`user:${normalizedEmail}`, user, { ex: 3600 });

    return {
      type: "registered",
      user,
    };
  }
}
