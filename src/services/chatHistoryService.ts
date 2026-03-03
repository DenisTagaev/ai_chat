import { getStreamChatHistoryFromDB } from "../db/operations";
import { ChatSelect } from "../db/schemas";
import { getRedisClient } from "./redisService";

const redis = getRedisClient();

export class ChatHistoryService {
  static async getHistory(userId: string): Promise<ChatSelect[]> {
    const cacheKey: string = `chat_history:${userId}`;
    const cachedData:
      {
        [x: string]: any;
      }[]
      | null = await redis.get<ChatSelect[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    const chatHistory:
      {
          [x: string]: any;
      }[] = await getStreamChatHistoryFromDB(userId);

    if (chatHistory.length > 0) {
      await redis.set(cacheKey, chatHistory, { ex: 600 });
    }

    return chatHistory;
  }

  static async invalidateHistory(userId: string): Promise<void> {
    const cacheKey: string = `chat_history:${userId}`;
    await redis.del(cacheKey);
  }
}
