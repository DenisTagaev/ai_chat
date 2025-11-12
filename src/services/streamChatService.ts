import { StreamChat, APIResponse, UserResponse, Channel } from "stream-chat";
import { StreamUser } from "../utils/interfaces";

const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

/** Check if a Stream Chat user exists */
export async function checkRegisteredStreamUser(
  id: string
): Promise<APIResponse & { users: UserResponse[] }> {
  return await streamChatClient.queryUsers({ id: { $eq: id } });
}

/** Create or update a Stream Chat user */
export async function createStreamUser(user: StreamUser) {
  return await streamChatClient.upsertUser(user as UserResponse);
}

/** Generate a Stream Chat token for the given user ID */
export function generateStreamUserToken(userId: string): string {
  return streamChatClient.createToken(userId);
}

/** Create a messaging channel for a user */
export async function createAiChatChannel(userId: string): Promise<Channel> {
  const channel = streamChatClient.channel("messaging", `chat-${userId}`, {
    created_by_id: "ai_bot",
  });
  await channel.create();
  return channel;
}

/** Send an AI message to the user's channel */
export async function sendMessageToAi(channel: Channel, message: string) {
  return await channel.sendMessage({ text: message, user_id: "ai_bot" });
}