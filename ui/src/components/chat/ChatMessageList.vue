<script setup lang="ts">
    import ChatMessage from './ChatMessage.vue'

    interface ChatMessageItem {
        readonly id?: string | number
        readonly role: 'user' | 'model'
        readonly content: string
    }

    defineProps<{
        messages: readonly ChatMessageItem[]
    }>()
</script>

<template>
  <div class="space-y-4">
    <ChatMessage
      v-for="msg in messages"
      :key="msg.id ?? `${msg.role}-${msg.content}`"
      :role="msg.role"
      :content="msg.content"
    />
  </div>
</template>
