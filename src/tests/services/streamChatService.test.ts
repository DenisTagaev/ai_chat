import { Channel } from "stream-chat";

const mockQueryUsers = jest.fn();
const mockUpsertUser = jest.fn();
const mockCreateToken = jest.fn();
const mockChannelFactory = jest.fn();
const mockSendMessage = jest.fn();
const mockChannelCreate = jest.fn();

jest.mock("stream-chat", () => {
  return {
    StreamChat: {
      getInstance: jest.fn(() => ({
        queryUsers: mockQueryUsers,
        upsertUser: mockUpsertUser,
        createToken: mockCreateToken,
        channel: mockChannelFactory,
      })),
    },
  };
});

import {
  checkRegisteredStreamUser,
  createStreamUser,
  generateStreamUserToken,
  createAiChatChannel,
  sendMessageToAi,
} from "../../services/streamChatService";

describe("streamChatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

    it("calls queryUsers with $eq filter and returns the user", async () => {
        const mockResponse = { users: [{ id: "u1" }] };
        mockQueryUsers.mockResolvedValueOnce(mockResponse);

        const res = await checkRegisteredStreamUser("u1");

        expect(mockQueryUsers).toHaveBeenCalledWith({ id: { $eq: "u1" } });
        expect(res).toBe(mockResponse);
    });

    it("calls upsertUser with provided user object and creates the user", async () => {
      const user = { id: "u1", name: "Name", role: "user" };
      const mockResp = { users: [user] };
      mockUpsertUser.mockResolvedValueOnce(mockResp);

      const res = await createStreamUser(user as any);

      expect(mockUpsertUser).toHaveBeenCalledWith(user);
      expect(res).toBe(mockResp);
    });

    it("returns StreamChat token for requested user", () => {
      mockCreateToken.mockReturnValueOnce("token-123");

      const token = generateStreamUserToken("u1");

      expect(mockCreateToken).toHaveBeenCalledWith("u1");
      expect(token).toBe("token-123");
    });

    it("creates StreamChat channel, calls create() and returns channel object", async () => {
      const fakeChannelObj = {
        create: mockChannelCreate,
      };
      mockChannelFactory.mockReturnValueOnce(fakeChannelObj);
      mockChannelCreate.mockResolvedValueOnce({ id: "chan1" });

      const channel = await createAiChatChannel("u1");

      expect(mockChannelFactory).toHaveBeenCalledWith("messaging", "chat-u1", {
        created_by_id: "ai_bot",
      });
      expect(mockChannelCreate).toHaveBeenCalled();
      expect(channel).toBe(fakeChannelObj);
    });

    it("calls sendMessage with ai_bot user and given text", async () => {
      const channelInstance = {
        sendMessage: mockSendMessage,
      } as unknown as Channel;

      mockSendMessage.mockResolvedValueOnce({});

      const res = await sendMessageToAi(channelInstance, "hello");

      expect(mockSendMessage).toHaveBeenCalledWith({
        text: "hello",
        user_id: "ai_bot",
      });
      expect(res).toBeDefined();
    });
});
