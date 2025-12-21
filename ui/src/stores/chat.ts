import { defineStore } from "pinia";
import { readonly, ref } from "vue";
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

export const useChatStore = defineStore("chat",  () => {
    const messages = ref<FormattedMessageState[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const userStore = useUserStore();

    const loadChatHistory = async () => {
        if(!userStore.userId) return;

        loading.value = true;
        error.value = null;

        try {
            const { data } = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/ai/chat-history`,
              {
                userId: userStore.userId,
              }
            );

            messages.value = data.messages.flatMap((msg: MessageState): FormattedMessageState[] => [
                { role: 'user', content: msg.message },
                { role: 'model', content: msg.reply },
            ]).map((msg: FormattedMessageState) => msg.content)
            .filter(Boolean);
        } catch (err) {
            error.value = 'Failed to load chat history';
            console.error(`Error loading chat history: ${err}`);
        } finally {
            loading.value = false;
        }
    }
    const reset = (): void => {
        messages.value = [];
        error.value = null;
    }

    return {
       messages: readonly(messages),
       loading: readonly(loading),
       error: readonly(error),
       loadChatHistory,
       reset,
     };
});