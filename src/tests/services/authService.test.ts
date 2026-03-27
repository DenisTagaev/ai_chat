const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock("../../services/redisService", () => ({
  getRedisClient: jest.fn(() => mockRedis),
}));

jest.mock("../../utils/idGenerator", () => jest.fn());
jest.mock("../../utils/dataValidator", () => ({
  validateAndNormalizeData: jest.fn(),
}));

jest.mock("../../services/streamChatService", () => ({
  StreamChatService: {
    upsertStreamUser: jest.fn(),
    getOrCreateChatChannel: jest.fn(),
  },
}));

jest.mock("../../db/operations", () => ({
  createNeonUser: jest.fn(),
}));

jest.mock("../../services/chatHistoryService", () => ({
  ChatHistoryService: {
    getHistory: jest.fn(),
  },
}));

jest.mock("../../services/userService", () => ({
  UserService: {
    getUserRegisterState: jest.fn(),
  },
}));

import { AuthService } from "../../services/authService";
import generateUserId from "../../utils/idGenerator";
import { validateAndNormalizeData } from "../../utils/dataValidator";
import { StreamChatService } from "../../services/streamChatService";
import { createNeonUser } from "../../db/operations";
import { ChatHistoryService } from "../../services/chatHistoryService";
import { UserService } from "../../services/userService";
import { AuthResult } from "../../utils/types";
import { ChatSelect } from "../../db/schemas";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const name = "Test";
  const email = "test@mail.com";
  const normalizedEmail = "test@mail.com";
  const userId = "user-123";

  // -----------------------------
  // validation error
  // -----------------------------
  it("should return validation_error case to mapper on invalid data", async () => {
    (validateAndNormalizeData as jest.Mock).mockReturnValue({
      error: "Invalid email",
    });

    const auth: AuthResult = await AuthService.authenticateOrRegister(name, email);

    expect(auth).toEqual({
      type: "validation_error",
      error: "Invalid email",
    });
  });

  // -----------------------------
  // cooldown
  // -----------------------------
  it("should return cooldown case to mapper if recent attempt exceeds the limit", async () => {
    (validateAndNormalizeData as jest.Mock).mockReturnValue({
      email: normalizedEmail,
    });

    (generateUserId as jest.Mock).mockReturnValue(userId);

    mockRedis.get.mockResolvedValue({});

    const auth: AuthResult = await AuthService.authenticateOrRegister(name, email);

    expect(mockRedis.get).toHaveBeenCalledWith(`register:${normalizedEmail}`);

    expect(auth).toEqual({ type: "cooldown" });
  });

  // -----------------------------
  // login (fully registered)
  // -----------------------------
  it("should return login case to mapper and include chat history", async () => {
    (validateAndNormalizeData as jest.Mock).mockReturnValue({
      email: normalizedEmail,
    });

    (generateUserId as jest.Mock).mockReturnValue(userId);
    mockRedis.get.mockResolvedValue(null);

    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "fully_registered",
    );

    const mockHistory: ChatSelect[] = [{ message: "Hi", reply: "Hello" }];

    (ChatHistoryService.getHistory as jest.Mock).mockResolvedValue(mockHistory);

    const auth: AuthResult = await AuthService.authenticateOrRegister(name, email);

    expect(auth).toEqual({
      type: "login",
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        role: "user",
      },
      chatHistory: mockHistory,
    });
  });

  // -----------------------------
  // already_registered
  // -----------------------------
  it("should return already_registered case to mapper if user exists only in stream or db", async () => {
    (validateAndNormalizeData as jest.Mock).mockReturnValue({
      email: normalizedEmail,
    });

    (generateUserId as jest.Mock).mockReturnValue(userId);

    mockRedis.get.mockResolvedValue(null);

    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "inconsistent_registration",
    );

    const auth: AuthResult = await AuthService.authenticateOrRegister(name, email);

    expect(auth).toEqual({
      type: "already_registered",
    });
  });

  // -----------------------------
  // new user registration
  // -----------------------------
  it("should register new user and create new channel", async () => {
    (validateAndNormalizeData as jest.Mock).mockReturnValue({
      email: normalizedEmail,
    });

    (generateUserId as jest.Mock).mockReturnValue(userId);

    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue(null);

    (UserService.getUserRegisterState as jest.Mock).mockResolvedValue(
      "not_registered",
    );

    (StreamChatService.upsertStreamUser as jest.Mock).mockResolvedValue({});
    (StreamChatService.getOrCreateChatChannel as jest.Mock).mockResolvedValue(
      {},
    );
    (createNeonUser as jest.Mock).mockResolvedValue({});

    const auth: AuthResult = await AuthService.authenticateOrRegister(name, email);

    expect(StreamChatService.upsertStreamUser).toHaveBeenCalled();
    expect(createNeonUser).toHaveBeenCalledWith(userId, name, normalizedEmail);
    expect(StreamChatService.getOrCreateChatChannel).toHaveBeenCalledWith(
      userId,
    );

    expect(mockRedis.set).toHaveBeenCalledWith(
      `user:${normalizedEmail}`,
      expect.any(Object),
      { ex: 3600 },
    );

    expect(auth).toEqual({
      type: "registered",
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        role: "user",
      },
    });
  });
});
