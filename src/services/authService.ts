import { APIResponse, UserResponse } from "stream-chat";
import generateUserId from "../utils/idGenerator";
import { StreamChatService } from "./streamChatService";
import { createNeonUser, getNeonUserById } from "../db/operations";
import { StreamUser } from "../utils/interfaces";
import { getRedisClient } from "./redisService";

const redis = getRedisClient();

export type AuthResult =
  | { type: "registered"; user: StreamUser; token: string }
  | { type: "login"; user: StreamUser }
  | { type: "cooldown" }
  | { type: "already_registered" };

export class AuthService {
  static async authenticateOrRegister(
    name: string,
    email: string,
  ): Promise<AuthResult> {
    const userId: string = generateUserId(email);

    const user: StreamUser = {
      id: userId,
      email,
      name,
      role: "user",
    };

    // ---- cooldown protection ----
    const cooldownKey: string = `register:${email}`;
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
      return { type: "login", user };
    }

    // partial mismatch safety
    if (existingNeonUser.length || existingStreamUser.users.length) {
      return { type: "already_registered" };
    }

    // ---- create new user ----
    await StreamChatService.createStreamUser(user);
    await createNeonUser(userId, name, email);

    await redis.set(`user:${email}`, user, { ex: 3600 });

    const token: string = StreamChatService.generateStreamUserToken(userId);

    return {
      type: "registered",
      user,
      token,
    };
  }
}
