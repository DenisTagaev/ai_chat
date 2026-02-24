import { StreamChat, APIResponse, UserResponse, Channel } from "stream-chat";
import { StreamUser } from "../utils/interfaces";

export class StreamChatClient {
  private readonly streamClient: StreamChat;

  constructor() {
    if(!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      throw new Error("Stream API credentials are not defined");
    }

    this.streamClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET,
    );
  }

  /** Check if a Stream Chat user exists */
  async checkRegisteredStreamUser(
    id: string
  ): Promise<APIResponse & { users: UserResponse[] }> {
    return await this.streamClient.queryUsers({ id: { $eq: id } });
  }

  /** Create or update a Stream Chat user */
  async createStreamUser(user: StreamUser) {
    return await this.streamClient.upsertUser(user as UserResponse);
  }

  /** Generate a Stream Chat token for the given user ID */
  generateStreamUserToken(userId: string): string {
    return this.streamClient.createToken(userId);
  }

  /** Create a messaging channel for a user */
  async createAiChatChannel(userId: string): Promise<Channel> {
    const channel = this.streamClient.channel(
      "messaging",
      `chat-${userId}`,
      {
        created_by_id: "ai_bot",
      }
    );
    await channel.create();
    return channel;
  }

  /** Send an AI message to the user's channel */
  async sendMessageToAi(channel: Channel, message: string) {
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

  public _getClient(): StreamChat {
    return this.streamClient;
  }
}

