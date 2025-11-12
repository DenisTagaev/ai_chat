import { StreamChat } from "stream-chat";

const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export async function checkRegisteredStreamUser(id: string){
    return await streamChatClient
    .queryUsers({ id: { $eq: id } });
}
