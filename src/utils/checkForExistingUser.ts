import { eq } from "drizzle-orm";
import { StreamChat } from "stream-chat";
import { db } from "../config/db";
import { users } from "../db/schemas";

const streamChatClient: StreamChat = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export async function checkRegisteredNeonUser(id: string){
    return await db
    .select()
    .from(users)
    .where(eq(users.userId, id));
} 

export async function checkRegisteredStreamUser(id: string){
    return await streamChatClient
    .queryUsers({ id: { $eq: id } });
}
