import { StreamChat, APIResponse, UserResponse, Channel, SendMessageAPIResponse } from "stream-chat";
import { StreamUser } from "../utils/interfaces";
import { logger } from "../utils/logger";
import { withTimeout } from "../utils/timeout";
import { TimeoutError } from "redis";

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
      return await withTimeout(
        this.streamClient.queryUsers({ id: { $eq: id } }),
        5000,
        "Stream user query"
      );
    } catch (err) {
      if(err instanceof TimeoutError) {
        logger.warn({ id }, "stream.user_query.timeout");
      } else {
        logger.error({ id, err }, "stream.user_query.fail");
      }
      throw err;
    }
  }

  /** Create or update a Stream Chat user */
  static async upsertStreamUser(
    user: StreamUser,
  ): Promise<APIResponse & { users: { [key: string]: UserResponse } }> {
    try {
      return await withTimeout(
        this.streamClient.upsertUser(user as UserResponse),
        3000,
        "Stream user upsert"
      );
    } catch (err) {
      if(err instanceof TimeoutError) {
        logger.warn({ userId: user.id }, "stream.user_upsert.timeout");
      } else {
        logger.error({ userId: user.id, err }, "stream.user_upsert.fail");
      }
      throw err;
    }
  }

  /** Create a messaging channel for a user */
  static async getOrCreateChatChannel(userId: string): Promise<Channel> {
    const channel: Channel = this.setAiChannel(userId);

    try{
      await withTimeout(
        channel.create(),
        3000,
        "Stream channel create"
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        logger.warn({ userId }, "stream.channel.create.timeout");
      } else {
        logger.debug({ userId, err }, "stream.channel.already_exists");
      }
      throw err;
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
      logger.warn("stream.message.unreadable");
      throw new Error("AI bot error");
    }

    try {
      const channel: Channel = await this.getOrCreateChatChannel(userId);
      return await withTimeout(
        channel.sendMessage({
          text: message,
          user_id: this.ai_user,
        }),
        5000,
        "Stream message send"
      );
    } catch (err) {
      if (err instanceof TimeoutError) {
        logger.warn({ userId }, "stream.message_send.timeout");
      } else {
        logger.error({ userId, err }, "stream.message_send.fail");
      }
      throw err;
    }

  }

  /** @internal testing only */
  static _getClient(): StreamChat {
    return this.streamClient;
  }
}