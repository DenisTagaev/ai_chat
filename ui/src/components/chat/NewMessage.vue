<script setup lang="ts">
    import { ref } from 'vue';

    const props = defineProps<{
        disabled?: boolean;
    }>();

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
    <section class="shrink-0 border-t border-gray-400 p-3 bg-slate-800 flex">
        <div class="mx-auto max-w-4xl">
            <div class="relative">
                <label for="new-message" class="sr-only">New message</label>
                <textarea
                    v-model="input"
                    id="new-message"
                    rows="1"
                    placeholder="Message AI assistant"
                    @keydown="handleKeyDown"
                    aria-label="New message"
                    class="w-full font-mono resize-none rounded-xl border border-slate-600 bg-slate-500 px-5 py-4 pr-16 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 block sm:text-sm text-white focus:outline-none "
                />
                <button
                    @click="sendMessage"
                    :disabled="!canSend()"
                    class="absolute bottom-2 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-500 disabled:opacity-25 disabled:cursor-not-allowed text-white">
                    <OhVueIcon name="bi-send-plus" class="h-6 w-6" />
                </button>
            </div>
        </div>
    </section>
</template>