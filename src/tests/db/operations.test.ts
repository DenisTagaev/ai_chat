import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users, chatsSessions, chats } from "../../db/schemas";
import {
  createNeonUser,
  getNeonUserById,
  createChatSession,
  getChatSessionsByChatId,
  getChatSessionsByUserId,
  persistChatMessage,
  getStreamChatHistoryFromDB,
} from "../../db/operations";

describe("Neon DB Operations", () => {
  const testUserId = "test_user_123";
  const testName = "Test User";
  const testEmail = "testuser@example.com";
  const testChatId = "test_chat_123";
  const testTitle = "Test Chat";
  const testMessage = "Hello AI!";
  const testReply = "Hello Human!";

  beforeAll(async () => {
    await db.delete(chats).where(eq(chats.chatId, testChatId));
    await db.delete(chatsSessions).where(eq(chatsSessions.chatId, testChatId));
    await db.delete(users).where(eq(users.userId, testUserId));
  });

  afterAll(async () => {
    await db.delete(chats).where(eq(chats.chatId, testChatId));
    await db.delete(chatsSessions).where(eq(chatsSessions.chatId, testChatId));
    await db.delete(users).where(eq(users.userId, testUserId));
  });

  it("should create a user in Neon DB", async () => {
    await createNeonUser(testUserId, testName, testEmail);

    const user = await getNeonUserById(testUserId);

    expect(user).toHaveLength(1);
    expect(user[0].userId).toBe(testUserId);
    expect(user[0].name).toBe(testName);
    expect(user[0].email).toBe(testEmail);
  });

  it("should create and retrieve a chat session by chat ID", async () => {
    await createChatSession(testChatId, testUserId, testTitle);

    const sessions = await getChatSessionsByChatId(testChatId);

    expect(sessions).toHaveLength(1);
    expect(sessions[0].chatId).toBe(testChatId);
    expect(sessions[0].userId).toBe(testUserId);
    expect(sessions[0].title).toBe(testTitle);
  });

  it("should retrieve chat sessions by user ID", async () => {
    const sessions = await getChatSessionsByUserId(testUserId);

    expect(sessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chatId: testChatId,
          title: testTitle,
        }),
      ]),
    );
  });

  it("should persist a chat message and reply", async () => {
    await persistChatMessage(testChatId, testMessage, testReply);

    const chatHistory = await getStreamChatHistoryFromDB(testChatId);

    expect(chatHistory.length).toBeGreaterThan(0);

    const lastMessage = chatHistory.at(-1);

    expect(lastMessage).toBeDefined();
    expect(lastMessage?.chatId).toBe(testChatId);
    expect(lastMessage?.message).toBe(testMessage);
    expect(lastMessage?.reply).toBe(testReply);
  });

  it("should retrieve the correct chat history", async () => {
    const chatHistory = await getStreamChatHistoryFromDB(testChatId);

    expect(chatHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chatId: testChatId,
          message: testMessage,
          reply: testReply,
        }),
      ]),
    );
  });

  it("should update the chat session timestamp when persisting a message", async () => {
    const before = await getChatSessionsByChatId(testChatId);

    expect(before).toHaveLength(1);

    await persistChatMessage(testChatId, "Second message", "Second reply");

    const after = await getChatSessionsByChatId(testChatId);

    expect(after).toHaveLength(1);
    expect(after[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
      before[0].updatedAt.getTime(),
    );
  });
});
