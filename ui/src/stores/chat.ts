import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import { useUserStore } from "./user";
import { chatService, type MessageState } from "../services/chatService";
import { handleApiError, type ApiErrorResult } from "../utils/apiErrorHandler";
import { useAbortController } from "../composables/useAbortController";

interface FormattedMessageState {
    role: 'user' | 'model';
    content: string;
}

export const useChatStore = defineStore("chat",  () => {
    const { controller, create, abort: abortRequest } = useAbortController();

    const messages = ref<FormattedMessageState[]>([]);
    const isInitializing = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const userStore = useUserStore();

    const loadChatHistory = async (chatId: string): Promise<void> => {
        if(!userStore.userId || !chatId) return;

        isInitializing.value = true;
        error.value = null;

        create();

        try {
            const data = await chatService.getChatHistory(
              chatId,
              userStore.userId,
              controller.value?.signal,
            );

            messages.value = data.messages.flatMap((msg: MessageState): FormattedMessageState[] => [
                { role: 'user', content: msg.message },
                { role: 'model', content: msg.reply },
            ]).filter((msg: FormattedMessageState): boolean => !!msg.content);
        } catch (err: unknown) {
            const errorResult: ApiErrorResult = handleApiError(err, 'Failed to load chat history');

            if (errorResult.message) {
                error.value = errorResult.message;
            }
        } finally {
          isInitializing.value = false;
          abortRequest();
        }
    }

    const reset = (): void => {
        abortRequest();

        messages.value = [];
        error.value = null;

        isInitializing.value = false;
        isLoading.value = false;
    }

    const sendAIRequest = async (chatId: string, message: string): Promise<void> => {
        if(!message.trim() || !userStore.userId || !chatId) return;

        messages.value.push({ role: 'user', content: message });
        isLoading.value = true;

        create();

        try {
            const data = await chatService.sendMessage(
              chatId,
              userStore.userId,
              message,
              controller.value?.signal
            );

            messages.value.push({ role: "model", content: data.reply });
        } catch (err: unknown) {
            const errorResult: ApiErrorResult = handleApiError(err, 'Failed to send message');

            if (errorResult.message) {
                error.value = errorResult.message;
            }

            messages.value.push({
                role: 'model',
                content: 'Error, enable to process the request'
            });
        } finally {
            isLoading.value = false;
            abortRequest();
        }
    }

    return {
       messages: readonly(messages),
       isLoading: readonly(isLoading),
       isInitializing: readonly(isInitializing),
       error: readonly(error),
       loadChatHistory,
       sendAIRequest,
       reset,
     };
});