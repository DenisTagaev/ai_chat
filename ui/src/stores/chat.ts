import { defineStore } from "pinia";
import { readonly, ref, watch } from "vue";
import axios from "axios";
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
        abortController.abort();
        abortController = null;
      }
    };

    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api/ai",
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

    const loadChatHistory = async (): Promise<void> => {
        if(!userStore.userId || messages.value.length) return;

        isInitializing.value = true;
        error.value = null;

        abortActiveRequest();
        abortController = new AbortController();

        try {
            const { data } = await api.post(
              '/chat-history',
              {
                userId: userStore.userId,
              },
              {
                signal: abortController.signal
              }
            );

            messages.value = data.messages.flatMap((msg: MessageState): FormattedMessageState[] => [
                { role: 'user', content: msg.message },
                { role: 'model', content: msg.reply },
            ]).filter((msg: FormattedMessageState) => msg.content);
        } catch (err: any) {
            if(err.name !== "AbortError"){
                error.value = 'Failed to load chat history';
                console.error(`Error loading chat history: ${err}`);
            }
        } finally {
            isInitializing.value = false;
            abortController = null;
        }
    }

    const reset = (): void => {
        abortActiveRequest();
        messages.value = [];
        error.value = null;
        localStorage.removeItem(STORAGE_KEY);
    }

    const sendAIRequest = async (message: string): Promise<void> => {
        if(!message.trim() || !userStore.userId) return;

        messages.value.push({ role: 'user', content: message });
        isLoading.value = true;

        abortActiveRequest();
        abortController = new AbortController();

        try {
            const { data } = await api.post(
              "/chat",
              {
                message,
                userId: userStore.userId,
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

    watch(
      messages,
      (val: FormattedMessageState[]) => {
        if(isHydrated.value) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      },
      { deep: true }
    )

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