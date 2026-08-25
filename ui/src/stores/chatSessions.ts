import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import { useUserStore } from "./user";
import { sessionsService, type ChatSession } from "../services/sessionsService";
import { handleApiError, type ApiErrorResult } from "../utils/apiErrorHandler";
import { useAbortController } from "../composables/useAbortController";

export const useChatSessionsStore = defineStore("chatSessions", () => {
  const { controller, create, abort: abortRequest } = useAbortController();
  const sessions = ref<ChatSession[]>([]);
  const userStore = useUserStore();

  async function fetchSessions(): Promise<void> {
    if (!userStore.userId) return;

    create();

    try {
      const chats = await sessionsService.fetchSessions(userStore.userId, controller.value?.signal);

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
      abortRequest();
    }
  }

  async function createSession(firstMessage: string): Promise<ChatSession> {
    if (!userStore.userId) {
      throw new Error("User Is not authenticated");
    };

    create();

    try {
      const data = await sessionsService.createSession(userStore.userId, firstMessage, controller.value?.signal);
      sessions.value.unshift(data);

      return data;
    } catch (error: unknown) {
      const errorResult: ApiErrorResult = handleApiError(
        error,
        'Failed to create chat session'
      );

      if (errorResult.message) {
        console.error(errorResult.message);
      }

      throw error;
    } finally {
      abortRequest();
    }
  }

  const updateSession = (chatId: string): void => {
    const session: ChatSession | undefined = sessions.value.find((session: ChatSession) => session.chatId === chatId);

    if (!session) return;

    session.updatedAt = new Date().toISOString();

    // Move the recently updated chat to the top
    const index: number = sessions.value.indexOf(session);

    if (index > 0) {
      sessions.value.splice(index, 1);
      sessions.value.unshift(session);
    }
  };

  function reset() {
    sessions.value = [];
  }

  return {
    sessions: readonly(sessions),
    fetchSessions,
    createSession,
    updateSession,
    reset,
  };
});
