jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    getStreamUser: jest.fn(),
  },
}));

jest.mock("../../db/operations", () => ({
  getNeonUserById: jest.fn(),
}));

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
  // registered path
  // -----------------------------
  it("should return registered case to mapper", async () => {
    (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: userId }],
    });
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: userId }]);

    const userState: UserRegistrationState =
      await UserService.getUserRegisterState(userId);

    expect(userState).toBe("registered");
  });

  // -----------------------------
  // inconsistent_registration path
  // -----------------------------
  it("should return inconsistent_registration case to mapper if Neon user is missing", async () => {
    (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: userId }],
    });
    (getNeonUserById as jest.Mock).mockResolvedValue([]);

    const userState: UserRegistrationState =
      await UserService.getUserRegisterState(userId);

    expect(userState).toBe("inconsistent_registration");
  });

  it("should return inconsistent_registration case to mapper if Stream user is missing", async () => {
    (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
      users: [],
    });
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: userId }]);

    const userState: UserRegistrationState =
      await UserService.getUserRegisterState(userId);

    expect(userState).toBe("inconsistent_registration");
  });

  // -----------------------------
  // unregistered path
  // -----------------------------
  it("should return inconsistent_registration case to mapper if Stream user is missing", async () => {
    (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
      users: [],
    });
    (getNeonUserById as jest.Mock).mockResolvedValue([]);

    const userState: UserRegistrationState =
      await UserService.getUserRegisterState(userId);

    expect(userState).toBe("unregistered");
  });
})