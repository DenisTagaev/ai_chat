<script setup lang="ts">
    import { computed } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { storeToRefs } from "pinia";

    import { useChatSessionsStore } from "../../../stores/chatSessions";
    import { useChatStore } from "../../../stores/chat";

    import SidebarControls from "./SidebarControls.vue";
    import SidebarHeader from "./SidebarHeader.vue";
    import SidebarEmptyList from "./sidebar_list/SidebarEmptyList.vue";
    import SidebarList from "./sidebar_list/SidebarList.vue";

    const props = defineProps<{
      collapsed: boolean;
      animating: boolean;
    }>();

    const emit = defineEmits<{
      (e: "select", chatId: string): void;
      (e: "toggle-collapse"): [];
    }>();

    const route = useRoute();
    const router = useRouter();

    const chatSessionsStore = useChatSessionsStore();
    const chatStore = useChatStore()

    const { sessions, hasFetchedSessions, isLoading } = storeToRefs(chatSessionsStore);

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
</script>

<template>
  <nav
    class="h-full flex flex-col min-h-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
    :class="{ 'sidebar-collapsed': props.collapsed }"
    aria-label="Chats history"
  >
    <SidebarControls
      :collapsed="props.collapsed"
      :animating="props.animating"
      @new-chat="handleNewChat"
      @toggle-collapse="emit('toggle-collapse')"
    />

    <SidebarHeader
      v-if="!props.collapsed"
      :count="sessions.length"
      :animating="props.animating"
      :opening="!props.collapsed"
    />

    <SidebarEmptyList
      v-if="hasFetchedSessions && !isLoading && sessions.length === 0"
    />

    <SidebarList
      v-else-if="!isLoading"
      :sessions="sessions"
      :current-chat-id="currentChatId"
      :collapsed="props.collapsed"
      :animating="props.animating"
      @select="handleSelect"
    />
  </nav>
</template>