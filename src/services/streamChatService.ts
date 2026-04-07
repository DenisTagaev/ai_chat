import { StreamChat, APIResponse, UserResponse, Channel, SendMessageAPIResponse } from "stream-chat";
import { StreamUser } from "../utils/interfaces";
import { logger } from "../utils/logger";

export class StreamChatService {
  private static readonly ai_user = "ai_bot";
  private static readonly streamClient: StreamChat = (() => {
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      throw new Error("Stream API credentials are not defined");
    }

    return StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET,
    );
  })();

  /** Check if a Stream Chat user exists */
  static async getStreamUser(
    id: string,
  ): Promise<APIResponse & { users: UserResponse[] }> {
    try {
      return await this.streamClient.queryUsers({ id: { $eq: id } });
    } catch (err) {
      logger.error({ id, err }, "Stream user querying fail");
      throw err;
    }
  }

  /** Create or update a Stream Chat user */
  static async upsertStreamUser(
    user: StreamUser,
  ): Promise<APIResponse & { users: { [key: string]: UserResponse } }> {
    try {
      return await this.streamClient.upsertUser(user as UserResponse);
    } catch (err) {
      logger.error({ userId: user.id, err }, "Stream user upsert fail");
      throw err;
    }
  }

  /** Create a messaging channel for a user */
  static async getOrCreateChatChannel(userId: string): Promise<Channel> {
    const channel: Channel = this.setAiChannel(userId);

    try{
      await channel.create()
    } catch{
      logger.debug({ userId }, "Channel already exists");
    }

    return channel;
  }

  private static setAiChannel(userId: string): Channel {
    return this.streamClient.channel(
      "messaging",
      `chat-${userId}`,
    {
      members: [userId],
      created_by_id: this.ai_user
    });
  }

  /** Send an AI message to the user's channel */
  static async sendMessageToAi(
    userId: string,
    message: string,
  ): Promise<SendMessageAPIResponse> {
    if (typeof message !== "string" || !message.trim()) {
      logger.warn({ userId }, "Unreadable message attempt");
      throw new Error("AI bot error");
    }

    try {
      const channel: Channel = await this.getOrCreateChatChannel(userId);
      return channel.sendMessage({
        text: message,
        user_id: this.ai_user,
      });
    } catch (err) {
      logger.error({ userId, err }, "Sending message to Stream failed");
      throw err;
    }

  }

  /** @internal testing only */
  static _getClient(): StreamChat {
    return this.streamClient;
  }
}