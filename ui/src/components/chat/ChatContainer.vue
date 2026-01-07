<script setup lang="ts">
    import { ref } from 'vue'
    import { useChatStore } from '../../stores/chat'
    import ChatMessageList from './ChatMessageList.vue'
    import ChatTypingIndicator from './ChatTypingIndicator.vue'
    import ChatError from './ChatError.vue'
    import { useAutoScroll } from '../../composables/useAutoScroll';
    import NewMessage from './NewMessage.vue'

    const chatStore = useChatStore()
    const containerRef = ref<HTMLElement | null>(null)

    useAutoScroll(containerRef, () => chatStore.messages.length)
</script>

<template>
    <div
        ref="containerRef"
        class="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
    >
        <ChatMessageList :messages="chatStore.messages" />
        <ChatError v-if="chatStore.error" :error="chatStore.error"/>
        <ChatTypingIndicator v-if="chatStore.isLoading" />
    </div>
    <NewMessage @send="chatStore.sendAIRequest"/>
</template>
