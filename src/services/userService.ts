import { APIResponse, UserResponse } from "stream-chat";
import { getNeonUserById } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { UserRegistrationState } from "../utils/types";
import { logger } from "../utils/logger";


export class UserService {
  /**
   * Verify user exists in both DB and Stream
   */
  static async getUserRegisterState(userId: string):
   Promise<UserRegistrationState> {
    try {
      const existingNeonUser: {
        [x: string]: any;
      }[] = await getNeonUserById(userId);
      const existingStreamUser: APIResponse & {
        users: UserResponse[];
      } = await StreamChatService.getStreamUser(userId);

      if(existingNeonUser.length > 0 && existingStreamUser.users?.length > 0) {
        logger.info({ userId }, "User registered");
        return "registered";
      }

      if (existingNeonUser.length <= 0 && existingStreamUser.users?.length <= 0) {
        logger.info({ userId }, "User not found");
        return "unregistered";
      }

      logger.warn({ userId }, "Inconsistent registration between Stream and DB");
      return "inconsistent_registration";
    } catch (err) {
      logger.error({ userId, err }, "UserService fail");
      throw err;
    }
  }
}
