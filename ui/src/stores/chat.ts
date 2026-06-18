import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import axios from "axios";
import { useUserStore } from "./user";
import { chatService, type MessageState } from "../services/chatService";

interface FormattedMessageState {
    role: 'user' | 'model';
    content: string;
}

export const useChatStore = defineStore("chat",  () => {
    let abortController: AbortController | null = null;

    const messages = ref<FormattedMessageState[]>([]);
    const isInitializing = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const userStore = useUserStore();

    const abortActiveRequest = (): void => {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    };

    const loadChatHistory = async (chatId: string): Promise<void> => {
        if(!userStore.userId || !chatId) return;

        isInitializing.value = true;
        error.value = null;

        abortActiveRequest();
        abortController = new AbortController();

        try {
            const data = await chatService.getChatHistory(
              chatId,
              userStore.userId,
              abortController.signal,
            );

            messages.value = data.messages.flatMap((msg: MessageState): FormattedMessageState[] => [
                { role: 'user', content: msg.message },
                { role: 'model', content: msg.reply },
            ]).filter((msg: FormattedMessageState): boolean => !!msg.content);
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response) {
            console.error(`API error: ${err.response.status} - ${err.response.data}`);
            error.value = `Failed to load chat history: ${err.response.data?.message || 'Unknown error'}`;
          }
          else if (err instanceof Error) {
            console.error('Error loading chat history: ', err);
            error.value = 'Failed to load chat history';
          }
          else {
            error.value = 'Failed to load chat history';
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

        isInitializing.value = false;
        isLoading.value = false;
    }

    const sendAIRequest = async (chatId: string, message: string): Promise<void> => {
        if(!message.trim() || !userStore.userId || !chatId) return;

        messages.value.push({ role: 'user', content: message });
        isLoading.value = true;

        abortActiveRequest();
        abortController = new AbortController();

        try {
            const data = await chatService.sendMessage(
              chatId,
              userStore.userId,
              message,
              abortController.signal
            );

            messages.value.push({ role: "model", content: data.reply });
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
              console.error(`API error: ${err.response.status} - ${err.response.data}`);
              error.value = `Failed to send message: ${err.response.data?.message || 'Unknown error'}`;
            } else if (err instanceof Error && (err.name === "CanceledError" || err.name === "AbortError")) return;
            
            else if (err instanceof Error) {
              console.error('Error sending message: ', err);
              error.value = 'Failed to reach the server';
            } else {
              error.value = 'Failed to send message';
            }
            
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
       error: readonly(error),
       loadChatHistory,
       sendAIRequest,
       abortActiveRequest,
       reset,
     };
});