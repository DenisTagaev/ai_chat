import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import axios, { type AxiosInstance } from "axios";
import { useUserStore } from "./user";

interface MessageState {
  message: string;
  reply: string;
}

interface FormattedMessageState {
    role: 'user' | 'model';
    content: string;
}

const STORAGE_KEY: string = "chat-messages";

export const useChatStore = defineStore("chat",  () => {
    let abortController: AbortController | null = null;

    const messages = ref<FormattedMessageState[]>([]);
    const isInitializing = ref(false);
    const isLoading = ref(false);
    const isHydrated = ref(false);
    const error = ref<string | null>(null);

    const userStore = useUserStore();

    const abortActiveRequest = (): void => {
      if (abortController) {
        abortController?.abort();
        abortController = null;
      }
    };

    const api: AxiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api/ai/chats",
    });

    const hydrateMessages = (): void => {
      if(isHydrated.value) return;

      const cached: string | null = localStorage.getItem(STORAGE_KEY);

      if(cached) {
        try{
          messages.value = JSON.parse(cached);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      isHydrated.value = true;
    }

    const loadChatHistory = async (chatId: string): Promise<void> => {
        if(!userStore.userId || !chatId) return;

        isInitializing.value = true;
        error.value = null;

        try {
            const { data } = await api.get(
              `/${chatId}/chat-history`,
              {
                params: {
                  userId: userStore.userId,
                  chatId: chatId,
                },
              },
            );

            messages.value = data.messages.flatMap((msg: MessageState): FormattedMessageState[] => [
                { role: 'user', content: msg.message },
                { role: 'model', content: msg.reply },
            ]).filter((msg: FormattedMessageState) => msg.content);
        } catch (err: any) {
          console.error(`Error loading chat history: ${err}`);
        } finally {
          isInitializing.value = false;
        }
    }

    const reset = (): void => {
        abortActiveRequest();
        messages.value = [];
        error.value = null;
    }

    const sendAIRequest = async (chatId: string, message: string): Promise<void> => {
        if(!message.trim() || !userStore.userId || !chatId) return;

        messages.value.push({ role: 'user', content: message });
        isLoading.value = true;

        abortActiveRequest();
        abortController = new AbortController();

        try {
            const { data } = await api.post(
              `/${chatId}`,
              {
                message,
                userId: userStore.userId,
                chatId: chatId,
              },
              {
                signal: abortController.signal,
              },
            );

            messages.value.push({ role: "model", content: data.reply });
        } catch (err: any) {
            if (err.name === "CanceledError" || err.name === "AbortError") return;

            console.error('Error sending message: ', err);
            error.value = 'Failed to reach the server';

            messages.value.push({
                role: 'model',
                content: 'Error, enable to process the request'
            });
        } finally {
            isLoading.value = false;
            abortController = null;
        }
    }

    return {
       messages: readonly(messages),
       isLoading: readonly(isLoading),
       isInitializing: readonly(isInitializing),
       isHydrated: readonly(isHydrated),
       error: readonly(error),
       hydrateMessages,
       loadChatHistory,
       sendAIRequest,
       abortActiveRequest,
       reset,
     };
});