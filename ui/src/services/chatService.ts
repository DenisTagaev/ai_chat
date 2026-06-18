import { api } from "./api";

export interface MessageState {
  message: string;
  reply: string;
}

export interface ChatHistoryResponse {
  messages: MessageState[];
}

export interface SendMessageResponse {
  reply: string;
}

export const chatService = {
  async getChatHistory(
    chatId: string,
    userId: string,
    signal?: AbortSignal,
  ): Promise<ChatHistoryResponse> {
    const { data } = await api.get<ChatHistoryResponse>(
      `/${chatId}/history`,
      {
        params: {
          userId,
        },
        signal,
      },
    );

    return data;
  },

  async sendMessage(
    chatId: string,
    userId: string,
    message: string,
    signal?: AbortSignal,
  ): Promise<SendMessageResponse> {
    const { data } = await api.post<SendMessageResponse>(
      `/${chatId}`,
      {
        userId,
        message,
      },
      {
        signal,
      },
    );

    return data;
  },
};
