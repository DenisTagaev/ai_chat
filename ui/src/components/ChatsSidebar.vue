<script setup lang="ts">
    import { computed } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { storeToRefs } from "pinia";
    import { useChatSessionsStore } from "../stores/chatSessions";
    import { useChatStore } from "../stores/chat";

    const emit = defineEmits<{
      (e: "select", chatId: string): void;
    }>();

    const route = useRoute();
    const router = useRouter();
    const chatSessionsStore = useChatSessionsStore();
    const chatStore = useChatStore()

    const { sessions } = storeToRefs(chatSessionsStore);

    const currentChatId = computed((): string => {
      return String(route.params.chatId ?? "");
    });

    const handleSelect = (chatId: string): void => {
      if (chatId === currentChatId.value) {
          return;
      }

      emit("select", chatId);
    };

    const handleNewChat = async(event: MouseEvent): Promise<void> => {
      chatStore.showNewChatArea();

      await router.push({ name: "Chats List" });
      (event.currentTarget as HTMLButtonElement).blur();
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
    class="h-full flex flex-col min-h-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
    aria-label="Chats history"
  >
    <button class="group flex w-full items-center gap-2 px-3 py-2 text-left font-mono font-semibold tracking-wider transition-colors border-slate-700 dark:border-slate-200 backdrop-blur-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 " type="button" @click="handleNewChat">
      <OhVueIcon name="gi-notebook" class="h-5 w-5 shrink-0 transition-transform text-slate-700 dark:text-slate-200 group-hover:scale-120" aria-hidden="true"/>
      <span >New Chat</span>
    </button>

    <header class="flex items-center justify-between p-4 border-b border-slate-700 dark:border-slate-200 backdrop-blur-lg">
      <h2 id="recent-chats-heading" class="text-lg font-semibold font-mono tracking-wide uppercase text-shadow-slate-800 dark:text-slate-200">Chats Log</h2>
      <span class="font-mono text-slate-500" aria-hidden="true">
        {{ sessions.length }}
      </span>
    </header>

    <p v-if="!sessions.length" class="p-4 text-medium text-center italic text-slate-500 dark:text-slate-400">
      No recent chats available.
    </p>

    <ul aria-labelledby="recent-chats-heading" v-else class="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
      <li v-for="session in sessions" :key="session.chatId" class="min-w-0">
        <button
          type="button"
          class="
            group
            relative
            flex
            flex-col
            w-full
            min-w-0
            text-left
            px-3
            py-3
            rounded-md
            bg-transparent
            transition-colors
            duration-200
            hover:bg-slate-200
            dark:hover:bg-slate-600
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/70
            focus:ring-inset-1
            focus:ring-inset-sky-600"
            :class="{
            'bg-slate-200 text-slate-800 ring-1 ring-blue-500/70 shadow-sm dark:bg-slate-800 dark:text-slate-200':
              session.chatId === currentChatId,
          }"
          :aria-current="
            session.chatId === currentChatId ? 'page' : undefined
          "
          @click="handleSelect(session.chatId)"
        >

          <span
            v-if="session.chatId === currentChatId"
            class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-sky-600"
            aria-hidden="true"
          />

          <span
            class="min-w-0 pr-2 font-mono font-medium truncate text-sm"
            :class="
              session.chatId === currentChatId
                ? 'text-blue-500 group-hover:text-blue-300'
                : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-100'
            "
          >
            {{ session.title }}
          </span>

          <span class="font-mono tracking-wide text-xs text-slate-600 mt-1 dark:text-slate-400 group-hover:text-slate-200">
            {{ formatDate(session.updatedAt) }}
          </span>

        </button>
      </li>
    </ul>
  </nav>
</template>