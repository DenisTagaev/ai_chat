import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { users, chats } from "../../db/schemas";
import {
  createNeonUser,
  getNeonUserById,
  saveStreamChatMessageToDB,
  getStreamChatHistoryFromDB,
} from "../../db/operations";

describe("Neon DB Operations", () => {
  const testUserId = "test_user_123";
  const testName = "Test User";
  const testEmail = "testuser@example.com";
  const testMessage = "Hello AI!";
  const testReply = "Hello Human!";

  beforeAll(async () => {
    // Ensure test user does not exist
    await db.delete(users).where(eq(users.userId, testUserId));
    await db.delete(chats).where(eq(chats.userId, testUserId));
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(chats).where(eq(chats.userId, testUserId));
    await db.delete(users).where(eq(users.userId, testUserId));
  });

  it("should create a user in Neon DB", async () => {
    await createNeonUser(testUserId, testName, testEmail);
    const user = await getNeonUserById(testUserId);
    expect(user.length).toBe(1);
    expect(user[0].userId).toBe(testUserId);
    expect(user[0].name).toBe(testName);
    expect(user[0].email).toBe(testEmail);
  });

  it("should save a chat message and reply in Neon DB", async () => {
    await saveStreamChatMessageToDB(testUserId, testMessage, testReply);
    const chatHistory = await getStreamChatHistoryFromDB(testUserId);
    expect(chatHistory.length).toBeGreaterThan(0);
    
    const lastMessage = chatHistory.at(-1);
    expect(lastMessage).toBeDefined();
    expect(lastMessage?.userId).toBe(testUserId);
    expect(lastMessage?.message).toBe(testMessage);
    expect(lastMessage?.reply).toBe(testReply);
  });

  it("should retrieve correct chat history", async () => {
    const chatHistory = await getStreamChatHistoryFromDB(testUserId);
    expect(chatHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: testUserId,
          message: testMessage,
          reply: testReply,
        }),
      ])
    );
  });
});