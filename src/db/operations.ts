import { db } from "../config/db";
import { withTimeout } from "../utils/timeout";
import { users, chats } from "./schemas";
import { eq } from "drizzle-orm";



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
  userId: string,
  message: string,
  reply: string
) {
  return withTimeout(
    db.insert(chats).values({ userId, message, reply }),
    5000,
    "CHATS INSERT call"
  );
}

export async function getStreamChatHistoryFromDB(userId: string) {
  return withTimeout(
    db.select().from(chats).where(eq(chats.userId, userId)),
    5000,
    "CHATS SELECT call"
  );
}
