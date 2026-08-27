import { api } from "./api";

export interface ChatSession {
  chatId: string;
  title: string;
  updatedAt: string;
}

export const sessionsService = {
  async fetchSessions(userId: string, signal?: AbortSignal): Promise<ChatSession[]> {
    const { data } = await api.get<{ chats: ChatSession[] }>("/", {
      params: {
        userId,
      },
      signal,
    });
    return data.chats;
  },

  async createSession(userId: string, message: string, signal?: AbortSignal): Promise<ChatSession> {
    const { data } = await api.post<ChatSession>("/", {
      userId,
      message
    },
    {
      signal,
    });
    return data;
  }
};