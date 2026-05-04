import { getStreamChatHistoryFromDB } from "../db/operations";
import { ChatSelect } from "../db/schemas";
import { logger } from "../utils/logger";
import { getRedisClient } from "./redisService";

const redis = getRedisClient();

export class ChatHistoryService {
  private static getCacheKey(chatId: string): string {
    return `chat_history:${chatId}`;
  }

  static async getHistory(chatId: string): Promise<ChatSelect[]> {
    const cacheKey: string = this.getCacheKey(chatId);
    const cachedData:
      | {
          [x: string]: any;
        }[]
      | null = await redis.get<ChatSelect[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      logger.info("chat_history.cache.hit");
      return cachedData;
    }

    const chatHistory: {
      [x: string]: any;
    }[] = await getStreamChatHistoryFromDB(chatId);
    logger.info("chat_history.cache.miss");

    if (chatHistory.length > 0) {
      logger.info("chat_history.cache.set");
      await redis.set(cacheKey, chatHistory, { ex: 600 });
    }

    return chatHistory;
  }

  static async addMessageToHistory(
    chatId: string,
    message: string,
    reply: string,
  ): Promise<void> {
    const cacheKey: string = this.getCacheKey(chatId);

    const cachedData:
      | {
          [x: string]: any;
        }[]
      | null = await redis.get<ChatSelect[]>(cacheKey);

    if(cachedData && Array.isArray(cachedData)){
      logger.info("chat_history.cache.update");
      cachedData.push({
        chatId,
        message,
        reply
      } as ChatSelect);
      logger.info({chatId}, "chat_history.cache.set");

      await redis.set(cacheKey, cachedData, {ex: 600 });
    }
  }

  static async invalidateHistory(chatId: string): Promise<void> {
    logger.info({chatId}, "chat_history.cache.invalidate");
    await redis.del(this.getCacheKey(chatId));
  }
}
