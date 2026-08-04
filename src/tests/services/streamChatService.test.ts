const mockChannel = {
  create: jest.fn(),
  sendMessage: jest.fn(),
};

const mockClient = {
  queryUsers: jest.fn(),
  upsertUser: jest.fn(),
  channel: jest.fn(() => mockChannel),
};

const mockGetInstance = jest.fn(() => mockClient);

jest.mock("stream-chat", () => ({
  StreamChat: {
    getInstance: mockGetInstance,
  },
}));

import { StreamChatService } from "../../services/streamChatService";
import { APIResponse, Channel, SendMessageAPIResponse, StreamChat, UserResponse } from "stream-chat";
import { StreamUser } from "../../utils/interfaces";

describe("StreamChatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.STREAM_API_KEY = "key";
    process.env.STREAM_API_SECRET = "secret";

    mockGetInstance.mockReturnValue(mockClient);
  });

  // -----------------------------
  // constructor
  // -----------------------------
  it("should throw an error if env variables are missing during initialization", () => {
    jest.resetModules();

    delete process.env.STREAM_API_KEY;
    delete process.env.STREAM_API_SECRET;

    expect(() => require("../../services/streamChatService")).toThrow(
      "Stream API credentials are not defined",
    );
  });

  // -----------------------------
  // getStreamUser
  // -----------------------------
  it("should query StreamChat users with provided params", async () => {
    mockClient.queryUsers.mockResolvedValue({ users: [] });

    const streamUser: APIResponse & {
      users: UserResponse[];
    } = await StreamChatService.getStreamUser("123");

    expect(mockClient.queryUsers).toHaveBeenCalledWith({
      id: { $eq: "123" },
    });

    expect(streamUser).toEqual({ users: [] });
  });

  // -----------------------------
  // upsertStreamUser
  // -----------------------------
  it("should create user in StreamChat", async () => {
    const user: StreamUser = {
      id: "123",
      email: "test@mail.com",
      name: "John Doe"
    };

    mockClient.upsertUser.mockResolvedValue({ users: {} });

    const newStreamUser: {
      users: {
        [key: string]: UserResponse;
      };
    } = await StreamChatService.upsertStreamUser(user);

    expect(mockClient.upsertUser).toHaveBeenCalledWith(user);
    expect(newStreamUser).toEqual({ users: {} });
  });

  // -----------------------------
  // getOrCreateChatChannel
  // -----------------------------
  it("should successfully create StreamChat channel", async () => {
    mockChannel.create.mockResolvedValue({});

    const channel: Channel = await StreamChatService.getOrCreateChatChannel("123");

    expect(mockClient.channel).toHaveBeenCalledWith("messaging", "chat-123", {
      members: ["123"],
      created_by_id: "ai_assistant",
    });

    expect(mockChannel.create).toHaveBeenCalled();
    expect(channel).toBe(mockChannel);
  });

  it("should ignore error if channel already exists", async () => {
    mockChannel.create.mockRejectedValue(new Error("exists"));

    const channel: Channel = await StreamChatService.getOrCreateChatChannel("123");

    expect(mockChannel.create).toHaveBeenCalled();
    expect(channel).toBe(mockChannel);
  });

  // -----------------------------
  // sendMessageToAi
  // -----------------------------
  it("should send a message to user channel", async () => {
    mockChannel.create.mockResolvedValue({});
    mockChannel.sendMessage.mockResolvedValue({ success: true });

    const message: SendMessageAPIResponse =
      await StreamChatService.sendMessageToAi("123", "Hello AI");

    expect(mockChannel.sendMessage).toHaveBeenCalledWith({
      text: "Hello AI",
      user_id: "ai_assistant",
    });

    expect(message).toEqual({ success: true });
  });

  it("should throw an error if message is invalid", async () => {
    await expect(StreamChatService.sendMessageToAi("123", "")).rejects.toThrow(
      "AI bot error",
    );
  });

  // -----------------------------
  // _getClient
  // -----------------------------
  it("should return underlying client", () => {
    const client: StreamChat = StreamChatService._getClient();

    expect(client).toBeDefined();
  });
});
