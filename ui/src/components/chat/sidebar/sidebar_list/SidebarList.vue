<script setup lang="ts">
  import type { ChatSession } from "../../../../services/sessionsService.ts";
  import SidebarListItem from "./SidebarListItem.vue";

  const props = defineProps<{
    sessions: readonly ChatSession[];
    currentChatId: string;
    collapsed: boolean;
    animating: boolean;
  }>();

  const emit = defineEmits<{
    (e: "select", chatId: string): void;
  }>();
</script>

<template>
  <ul
    aria-labelledby="recent-chats-heading"
    class="sidebar-content flex-1 min-h-0 overflow-y-auto p-2 space-y-2"
  >
    <SidebarListItem
      v-for="(session, index) in props.sessions"
      :key="session.chatId"
      :session="session"
      :index="index"
      :current-chat-id="props.currentChatId"
      :collapsed="props.collapsed"
      :animating="props.animating"
      @select="emit('select', $event)"
    />
  </ul>
</template>