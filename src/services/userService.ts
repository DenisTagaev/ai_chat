import { APIResponse, UserResponse } from "stream-chat";
import { getNeonUserById } from "../db/operations";
import { StreamChatService } from "./streamChatService";
import { UserRegistrationState } from "../utils/types";


export class UserService {
  /**
   * Verify user exists in both DB and Stream
   */
  static async getUserRegisterState(userId: string):
   Promise<UserRegistrationState> {
    const existingNeonUser: {
      [x: string]: any;
    }[] = await getNeonUserById(userId);

    const existingStreamUser: APIResponse & {
      users: UserResponse[];
    } = await StreamChatService.getStreamUser(userId);

    if(existingNeonUser.length > 0 && existingStreamUser.users?.length > 0) return "registered";
    if (existingNeonUser.length <= 0 && existingStreamUser.users?.length <= 0) return "unregistered";

    return "inconsistent_registration";
  }
}
