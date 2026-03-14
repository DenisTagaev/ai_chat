import { APIResponse, UserResponse } from "stream-chat";
import { getNeonUserById } from "../db/operations";
import { StreamChatService } from "./streamChatService";


export class UserService {
  /**
   * Verify user exists in both DB and Stream
   */
  static async verifyUserExists(userId: string): Promise<{
        neonExists: boolean;
        streamExists: boolean;
    }> {
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    const existingStreamUser: APIResponse & {
      users: UserResponse[];
    } = await StreamChatService.checkRegisteredStreamUser(userId);

    return {
      neonExists: existingNeonUser.length > 0,
      streamExists: existingStreamUser.users.length > 0,
    };
  }
}
