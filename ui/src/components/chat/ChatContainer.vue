<script setup lang="ts">
    import { ref, computed, type ComputedRef, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import { useChatStore } from '../../stores/chat'

    import ChatMessageList from './ChatMessageList.vue'
    import ChatTypingIndicator from './ChatTypingIndicator.vue'
    import ChatError from './ChatError.vue'
    import NewMessage from './NewMessage.vue'
    import { useAutoScroll } from '../../composables/useAutoScroll';

    const route = useRoute();
    const chatStore = useChatStore();
    const containerRef = ref<HTMLElement | null>(null);
    const chatId: ComputedRef<string> = computed<string>(() => route.params.chatId as string);

    useAutoScroll(containerRef, (): number => chatStore.messages.length);

    const loadChat = async (id: string): Promise<void> => {
        if (!id) {
            return;
        }

        chatStore.reset();
        await chatStore.loadChatHistory(id);
    };

    watch(
        chatId,
        async (id: string): Promise<void> => {
            await loadChat(id);
        },
        { immediate: true }
    );
</script>

<template>
    <div
        ref="containerRef"
        class="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
    >
        <div v-show="chatStore.isInitializing" class="space-y-2 animate-pulse">
            <div class="h-3 w-1/2 rounded bg-white/30"></div>
            <div class="h-3 w-3/4 rounded bg-white/20"></div>
        </div>
        <div v-show="!chatStore.isInitializing">
            <ChatMessageList :messages="chatStore.messages" />
            <ChatError v-if="chatStore.error" :error="chatStore.error"/>
            <ChatTypingIndicator v-if="chatStore.isLoading" />
        </div>
    </div>
    <NewMessage v-if="!chatStore.isInitializing" @send="chatStore.sendAIRequest(chatId, $event)"/>
</template>
