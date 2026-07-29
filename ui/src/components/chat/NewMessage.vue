<script setup lang="ts">
    import { ref, watch, onBeforeUnmount } from 'vue';
    import { onClickOutside } from '@vueuse/core'
    import { useRoute } from 'vue-router'
    import { useChatStore } from '../../stores/chat';


    const props = defineProps<{
        disabled?: boolean;
    }>();

    const emit = defineEmits<{
        (e: 'send', message: string): void
    }>();

    const input = ref("");
    const clickTarget = ref<HTMLElement | null>(null)

    const chatStore = useChatStore()
    const route = useRoute()

    let stopListening: (() => void) | null = null;

    watch(
        (): boolean => chatStore.isCreatingChat,
        (isCreating) => {
            stopListening?.()
            stopListening = null

            if (!isCreating) return

            stopListening = onClickOutside(clickTarget, () => {
                if (!route.params.chatId) {
                    chatStore.hideNewChatArea()
                }
            })
        },
        { immediate: true }
    )

    const canSend = (): boolean => {
        return input.value.trim().length > 0 && !props.disabled;
    };

    const sendMessage = (): void => {
        if(!canSend()) return;

        const msgToSend: string = input.value.trim();
        emit('send', msgToSend);

        input.value = '';
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
        if(event.key === 'Enter' && canSend() && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    onBeforeUnmount(() => {
        stopListening?.()
    });
</script>

<template>
    <section class=" flex shrink-0 border-t p-3 border-gray-400 bg-slate-100 dark:bg-slate-800">
        <div class="mx-auto w-full max-w-xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
            <div class="relative" ref="clickTarget">
                <label for="new-message" class="sr-only">New message</label>
                <textarea
                    v-model="input"
                    id="new-message"
                    rows="1"
                    placeholder="Message AI assistant"
                    @keydown="handleKeyDown"
                    class="w-full font-mono resize-none rounded-xl border border-slate-600 bg-slate-500 px-5 py-4 pr-16 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:placeholder:text-white block sm:text-sm text-white focus:outline-none "
                />
                <button
                    @click="sendMessage"
                    :disabled="!canSend()"
                    type="button"
                    aria-label="Send message"
                    class="absolute bottom-2 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-500 disabled:opacity-25 disabled:cursor-not-allowed text-white">
                    <OhVueIcon name="bi-send-plus" class="h-6 w-6" />
                </button>
            </div>
        </div>
    </section>
</template>