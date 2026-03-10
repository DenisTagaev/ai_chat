import { StreamChat, APIResponse, UserResponse, Channel } from "stream-chat";
import { StreamUser } from "../utils/interfaces";

export class StreamChatService {
  private static readonly streamClient: StreamChat = (() => {
    if(!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      throw new Error("Stream API credentials are not defined");
    }

    return StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET,
    );
  })();

  /** Check if a Stream Chat user exists */
  static async checkRegisteredStreamUser(
    id: string
  ): Promise<APIResponse & { users: UserResponse[] }> {
    return await this.streamClient.queryUsers({ id: { $eq: id } });
  }

  /** Create or update a Stream Chat user */
  static async createStreamUser(user: StreamUser) {
    return await this.streamClient.upsertUser(user as UserResponse);
  }

  /** Generate a Stream Chat token for the given user ID */
  static generateStreamUserToken(userId: string): string {
    return this.streamClient.createToken(userId);
  }

  /** Create a messaging channel for a user */
  static async createAiChatChannel(userId: string): Promise<Channel> {
    const channel: Channel = this.streamClient.channel(
      "messaging",
      `chat-${userId}`,
      {
        members: [userId],
        created_by_id: "ai_bot",
      }
    );
    await channel.watch();
    return channel;
  }

  static getAiChannel(userId: string): Channel {
    return this.streamClient.channel("messaging", `chat-${userId}`);
  }

  /** Send an AI message to the user's channel */
  static async sendMessageToAi(channel: Channel, message: string) {
    if(!message.trim()) {
      throw new Error("AI bot error");
    }

    return await channel.sendMessage(
      {
        text: message,
        user_id: "ai_bot"
      }
    );
  }

  static _getClient(): StreamChat {
    return this.streamClient;
  }
}