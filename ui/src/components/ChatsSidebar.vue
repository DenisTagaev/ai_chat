<!-- src/components/chat/ChatSidebar.vue -->
<script setup lang="ts">
    import { computed } from "vue";
    import { useRoute } from "vue-router";
    import { storeToRefs } from "pinia";
    import { useChatSessionsStore } from "../stores/chatSessions";

    const emit = defineEmits<{
        (e: "select", chatId: string): void;
    }>();

    const route = useRoute();
    const chatSessionsStore = useChatSessionsStore();

    const { sessions } = storeToRefs(chatSessionsStore);

    const currentChatId = computed((): string => {
        return String(route.params.id ?? "");
    });

    const handleSelect = (chatId: string): void => {
        if (chatId === currentChatId.value) {
            return;
        }

        emit("select", chatId);
    };

    const formatDate = (isoDate: string): string => {
    const date: Date = new Date(isoDate);

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    }).format(date);
    };
</script>

<template>
  <nav
    class="h-full flex flex-col bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
    aria-label="Chat history"
    role="navigation"
  >
    <button class="px-3 mx-2 py-2 text-left rounded-md border-slate-700 dark:border-slate-200 backdrop-blur-lg hover:*:bg-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 ">
      <OhVueIcon name="gi-notebook" class="text-slate-700 dark:text-slate-200" />
      New Chat
    </button>
    <header class="p-4 border-b border-slate-700 dark:border-slate-200 backdrop-blur-lg">
      <h2 class="text-lg font-semibold font-mono tracking-tight text-shadow-slate-800 dark:text-slate-200">Recent Chats</h2>
    </header>

    <p v-if="!sessions.length" class="p-4 text-medium italic text-slate-500 dark:text-slate-400">
      No recent chats available.
    </p>
    <ul v-else class="flex-1 overflow-y-auto p-2 space-y-2">
      <li v-for="session in sessions" :key="session.chatId">
        <button
          type="button"
          class="w-full text-left px-3 py-3 rounded-lg bg-transparent transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800"
          :class="{
            'bg-slate-200 text-slate-800 ring-1 ring-blue-500/70 shadow-sm dark:bg-slate-800 dark:text-slate-200':
              session.chatId === currentChatId,
          }"
          :aria-current="
            session.chatId === currentChatId ? 'page' : undefined
          "
          @click="handleSelect(session.chatId)"
        >
          <div class="font-medium truncate text-sm">
            {{ session.title }}
          </div>

          <div class="text-xs text-slate-600 mt-1 dark:text-slate-400">
            {{ formatDate(session.updatedAt) }}
          </div>
        </button>
      </li>
    </ul>
  </nav>
</template>