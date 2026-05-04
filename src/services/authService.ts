import generateUserId from "../utils/idGenerator";
import { StreamChatService } from "./streamChatService";
import { createNeonUser } from "../db/operations";
import { StreamUser } from "../utils/interfaces";
import { getRedisClient } from "./redisService";
import { validateAndNormalizeData } from "../utils/dataValidator";
import { AuthResult } from "../utils/types";
import { ChatHistoryService } from "./chatHistoryService";
import { UserService } from "./userService";
import { logger } from "../utils/logger";

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
    logger.debug({ email }, "auth.validate.start");

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
      logger.warn({ email }, "auth.cooldown.active");
      return { type: "cooldown" };
    }

    await redis.set(cooldownKey, user, { ex: 10 });

    // ---- DB checks ----
    const state: string = await UserService.getUserRegisterState(userId);

    switch (state) {
      case "fully_registered":
        logger.info("auth.login.success");
        return { type: "login", user, chatHistory: await ChatHistoryService.getHistory(userId) };

      case "inconsistent_registration":
        logger.warn("auth.registration.conflict");
        return { type: "already_registered" };

      case "not_registered":
        break;
    }

    // ---- create new user ----
    await StreamChatService.upsertStreamUser(user);
    await createNeonUser(userId, name, normalizedEmail);
    await redis.set(`user:${normalizedEmail}`, user, { ex: 3600 });

    logger.info("auth.register.success");

    return {
      type: "registered",
      user,
    };
  }
}
