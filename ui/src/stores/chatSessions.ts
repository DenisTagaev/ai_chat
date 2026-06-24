import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import { useUserStore } from "./user";
import { sessionsService, type ChatSession } from "../services/sessionsService";
import { handleApiError, type ApiErrorResult } from "../utils/apiErrorHandler";

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
      const errorResult: ApiErrorResult = handleApiError(
        error,
        'Failed to fetch chat sessions'
      );

      if (errorResult.message) {
        console.error(errorResult.message);
      }
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
      const errorResult: ApiErrorResult = handleApiError(
        error,
        'Failed to create chat session'
      );

      if (errorResult.message) {
        console.error(errorResult.message);
      }
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
