import { getStreamChatHistoryFromDB } from "../db/operations";
import { ChatSelect } from "../db/schemas";
import { logger } from "../utils/logger";
import { getRedisClient } from "./redisService";

const redis = getRedisClient();

export class ChatHistoryService {
  private static getCacheKey(userId: string): string {
    return `chat_history:${userId}`;
  }

  static async getHistory(userId: string): Promise<ChatSelect[]> {
    const cacheKey: string = this.getCacheKey(userId);
    const cachedData:
      | {
          [x: string]: any;
        }[]
      | null = await redis.get<ChatSelect[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      logger.info({ userId }, "Chat history cache hit");
      return cachedData;
    }

    const chatHistory: {
      [x: string]: any;
    }[] = await getStreamChatHistoryFromDB(userId);
    logger.info({ userId }, "Chat history cache absent, querying DB");

    if (chatHistory.length > 0) {
      logger.info({ userId }, "Chat history cache set");
      await redis.set(cacheKey, chatHistory, { ex: 600 });
    }

    return chatHistory;
  }

  static async addMessageToHistory(
    userId: string,
    message: string,
    reply: string,
  ): Promise<void> {
    const cacheKey = this.getCacheKey(userId);

    const cachedData:
      | {
          [x: string]: any;
        }[]
      | null = await redis.get<ChatSelect[]>(cacheKey);

    if(cachedData && Array.isArray(cachedData)){
      logger.info({ userId }, "Chat history cache update");
      cachedData.push({
        message,
        reply
      } as ChatSelect);

      await redis.set(cacheKey, cachedData, {ex: 600 });
    }
  }

  static async invalidateHistory(userId: string): Promise<void> {
    logger.info({ userId }, "Chat history cache cleared");
    await redis.del(this.getCacheKey(userId));
  }
}
