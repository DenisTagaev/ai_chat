import { db } from "../config/db";
import { withTimeout } from "../utils/timeout";
import { users, chats, chatsSessions } from "./schemas";
import { desc, eq, sql } from "drizzle-orm";

// --- USERS ---
export async function createNeonUser(id: string, name: string, email: string) {
  return withTimeout(
    db.insert(users).values({ userId: id, name, email }),
    5000,
    "USERS INSERT call"
  );
}

export async function getNeonUserById(userId: string) {
  return withTimeout(
    db.select().from(users).where(eq(users.userId, userId)),
    5000,
    "USERS SELECT call"
  );
}

// --- CHATS ---
export async function saveStreamChatMessageToDB(
  chatId: string,
  message: string,
  reply: string
) {
  return withTimeout(
    db.insert(chats).values({ chatId, message, reply }),
    5000,
    "CHATS INSERT call"
  );
}

export async function getStreamChatHistoryFromDB(chatId: string) {
  return withTimeout(
    db.select().from(chats).where(eq(chats.chatId, chatId)),
    5000,
    "CHATS SELECT call"
  );
}

// --- CHAT SESSIONS ---

export async function createChatSession(chatId: string, userId: string, title: string) {
  return withTimeout(
    db.insert(chatsSessions).values({ chatId, userId, title }),
    5000,
    "CHAT SESSIONS INSERT call"
  );
}

export async function getChatSessionsByChatId(chatId: string) {
  return withTimeout(
    db.select().from(chatsSessions).where(eq(chatsSessions.chatId, chatId)),
    5000,
    "CHAT SESSIONS SELECT by chatId call"
  );
}

export async function getChatSessionsByUserId(userId: string) {
  return withTimeout(
    db.select({
      chatId: chatsSessions.chatId,
      title: chatsSessions.title,
      lastReply: chats.reply,
      updatedAt: chats.updatedAt,
    })
    .from(chatsSessions)
    .leftJoin(
      chats,
      sql`${chats.id} = (
        SELECT c.id FROM ${chats} AS c
        WHERE c.chat_id = ${chatsSessions.chatId}
        ORDER BY c.created_at DESC
        LIMIT 1
      )`
    )
    .where(eq(chatsSessions.userId, userId))
    .orderBy(desc(sql`COALESCE(${chatsSessions.updatedAt}, ${chats.updatedAt})`)),
    5000,
    "CHAT SESSIONS SELECT by userId call"
  );
}