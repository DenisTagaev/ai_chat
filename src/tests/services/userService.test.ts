jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    getStreamUser: jest.fn(),
  },
}));

jest.mock("../../db/operations", () => ({
  getNeonUserById: jest.fn(),
}));

import { APIResponse, UserResponse } from "stream-chat";
import { getNeonUserById } from "../../db/operations";
import { StreamChatService } from "../../services/streamChatService";
import { UserRegistrationState } from "../../utils/types";
import { UserService } from "../../services/userService";

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userId: string = "user-123";

  // -----------------------------
  // success path
  // -----------------------------
  it("should return registered case to mapper", async () => {
    (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({users: [{ id: userId }]});
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: userId }]);
    const userState = await UserService.getUserRegisterState(userId);

    expect(userState).toBe("registered");
  });
})