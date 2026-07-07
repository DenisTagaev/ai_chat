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
      const neonUser: {
        [x: string]: any;
      }[] = await getNeonUserById(userId);
      const streamUser: APIResponse & {
        users: UserResponse[];
      } = await StreamChatService.getStreamUser(userId);

      const isNeonUser: boolean = neonUser.length > 0;
      const isStreamUser: boolean = !!streamUser.users?.length;

      return {
        isNeonUser,
        isStreamUser
      };
    } catch (err) {
      logger.error({ err }, "user.service.fail");
      throw err;
    }
  }
}
