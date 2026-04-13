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
        logger.info("user.status.registered");
        return "registered";
      }

      if (existingNeonUser.length <= 0 && existingStreamUser.users?.length <= 0) {
        logger.info("user.status.unregistered");
        return "unregistered";
      }

      logger.warn("user.status.inconsistent_registration");
      return "inconsistent_registration";
    } catch (err) {
      logger.error({ err }, "user.service.fail");
      throw err;
    }
  }
}
