jest.mock("../../db/operations", () => ({
  getNeonUserById: jest.fn(),
}));

jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    getStreamUser: jest.fn(),
  },
}));

import { UserService } from "../../services/userService";
import { getNeonUserById } from "../../db/operations";
import { StreamChatService } from "../../services/streamChatService";
import { TimeoutError } from "../../utils/timeout";

describe("UserService", () => {
  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserRegisterState", () => {
    it("should return true for both Neon and Stream when user exists in both", async () => {
      (getNeonUserById as jest.Mock).mockResolvedValue([
        {
          userId,
          name: "Denis",
          email: "denis@test.com",
        },
      ]);

      (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
        users: [
          {
            id: userId,
          },
        ],
      });

      const result = await UserService.getUserRegisterState(userId);

      expect(getNeonUserById).toHaveBeenCalledWith(userId);
      expect(StreamChatService.getStreamUser).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        isNeonUser: true,
        isStreamUser: true,
      });
    });

    it("should return false for both when user does not exist in either service", async () => {
      (getNeonUserById as jest.Mock).mockResolvedValue([]);

      (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
        users: [],
      });

      const result = await UserService.getUserRegisterState(userId);

      expect(result).toEqual({
        isNeonUser: false,
        isStreamUser: false,
      });
    });

    it("should detect when user only exists in Neon", async () => {
      (getNeonUserById as jest.Mock).mockResolvedValue([
        {
          userId,
        },
      ]);

      (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
        users: [],
      });

      const result = await UserService.getUserRegisterState(userId);

      expect(result).toEqual({
        isNeonUser: true,
        isStreamUser: false,
      });
    });

    it("should detect when user only exists in Stream", async () => {
      (getNeonUserById as jest.Mock).mockResolvedValue([]);

      (StreamChatService.getStreamUser as jest.Mock).mockResolvedValue({
        users: [
          {
            id: userId,
          },
        ],
      });

      const result = await UserService.getUserRegisterState(userId);

      expect(result).toEqual({
        isNeonUser: false,
        isStreamUser: true,
      });
    });

    it("should rethrow a database error", async () => {
      const error = new Error("Database failure");

      (getNeonUserById as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getUserRegisterState(userId)).rejects.toThrow(
        "Database failure",
      );

      expect(StreamChatService.getStreamUser).not.toHaveBeenCalled();
    });

    it("should rethrow a Stream timeout error", async () => {
      const error = new TimeoutError("Stream request timed out");

      (getNeonUserById as jest.Mock).mockResolvedValue([]);

      (StreamChatService.getStreamUser as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getUserRegisterState(userId)).rejects.toThrow(
        "Stream request timed out",
      );
    });
  });
});
