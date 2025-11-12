import { db } from "../config/db";
import { users, chats } from "./schemas";
import { eq } from "drizzle-orm";

// --- USERS ---
export async function createNeonUser(id: string, name: string, email: string) {
  return db.insert(users).values({ id, name, email });
}

export async function getNeonUserById(userId: string) {
  return db.select().from(users).where(eq(users.userId, userId));
}

// --- CHATS ---
export async function saveStreamChatMessageToDB(
  userId: string,
  message: string,
  reply: string
) {
  return db.insert(chats).values({ userId, message, reply });
}

export async function getStreamChatHistoryFromDB(userId: string) {
  return db.select().from(chats).where(eq(chats.userId, userId));
}
