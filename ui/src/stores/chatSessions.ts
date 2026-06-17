import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "../services/api";
import { useUserStore } from "./user";

export interface ChatSession {
  chatId: string;
  title: string;
  updatedAt: string;
}

export const useChatSessionsStore = defineStore("chatSessions", () => {
  const sessions = ref<ChatSession[]>([]);
  const userStore = useUserStore();

  async function fetchSessions() {
    if (!userStore.userId) return;

    const { data } = await api.get("/", {
      params: {
        userId: userStore.userId,
      },
    });

    sessions.value = data.chats;
  }

  async function createSession(firstMessage: string) {
    if (!userStore.userId) return;

    const { data } = await api.post("/", {
      userId: userStore.userId,
      firstMessage,
    });

    sessions.value.unshift(data);
    return data;
  }

  function reset() {
    sessions.value = [];

  }

  return {
    sessions,
    fetchSessions,
    createSession,
    reset,
  };
});
