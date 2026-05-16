<script setup lang="ts">
    import { ref } from 'vue';

    const emit = defineEmits<{
        (e: 'send', message: string): void
    }>();

    const input = ref("");
    const isSending = ref(false);

    const canSend = (): boolean => {
        return input.value.trim().length > 0 && !isSending.value;
    };

    const sendMessage = async(): Promise<void> => {
        if(!canSend()) return;

        isSending.value = true;
        const msgToSend: string = input.value.trim();

        try {
            emit('send', msgToSend);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            input.value = '';
            isSending.value = false;
        }
    }

    const handleKeyDown = async(event: KeyboardEvent): Promise<void> => {
        if(event.key === 'Enter' && canSend() && !event.shiftKey) {
            event.preventDefault();
            await sendMessage();
        }
    }
</script>

<template>
    <section class="border-t border-gray-400 p-3 bg-slate-700 flex">
        <div class="flex items-end gap-2">
            <textarea
                v-model="input"
                rows="1"
                placeholder="Send message to AI"
                @keydown="handleKeyDown"
                class="flex-1 resize-none px-3 py-2 rounded-md bg-slate-500 text-white focus:outline-none"
            />
            <button
                @click="sendMessage"
                :disabled="!canSend()"
                class="ml-2 px-4 py-2 bg-blue-700 hover:bg-blue-500 rounded-md disabled:opacity-25 disabled:cursor-not-allowed text-white">
                Send
            </button>
        </div>
    </section>
</template>