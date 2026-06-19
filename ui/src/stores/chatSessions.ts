import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import { useUserStore } from "./user";
import { sessionsService, type ChatSession } from "../services/sessionsService";
import { AxiosError } from "axios";

export const useChatSessionsStore = defineStore("chatSessions", () => {
  let abortController: AbortController | null = null;
  const sessions = ref<ChatSession[]>([]);
  const userStore = useUserStore();

  const abortActiveRequest = (): void => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  async function fetchSessions(): Promise<void> {
    if (!userStore.userId) return;

    abortActiveRequest();
    abortController = new AbortController();

    try {
      const chats = await sessionsService.fetchSessions(userStore.userId, abortController.signal);

      sessions.value = chats;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error(
          `API error: ${error.response.status} - ${error.response.data}`,
        );
      } else if (
        error instanceof Error && 
        (error.name === "CanceledError" || error.name === "AbortError")
      ) return;
      
      else if (error instanceof Error) {
        console.error("Error fetching sessions:", error.message);
      } else console.error("Error fetching sessions");
    } finally {
      abortController = null;
    }
  }

  async function createSession(firstMessage: string): Promise<void> {
    if (!userStore.userId) return;

    abortActiveRequest();
    abortController = new AbortController();

    try {
      const data = await sessionsService.createSession(userStore.userId, firstMessage, abortController.signal);
      sessions.value.unshift(data);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error(
          `API error: ${error.response.status} - ${error.response.data}`,
        );
      } else if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.name === "AbortError")
      ) return;

      else if (error instanceof Error) {
        console.error("Error creating session:", error.message);
      } else console.error("Error creating session");
    } finally {
      abortController = null;
    }
  }

  function reset() {
    sessions.value = [];
  }

  return {
    sessions: readonly(sessions),
    fetchSessions,
    createSession,
    reset,
  };
});
