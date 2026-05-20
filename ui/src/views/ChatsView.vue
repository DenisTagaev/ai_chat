<script setup lang="ts">
    import {
        computed,
        defineAsyncComponent,
        onMounted,
    } from "vue";
    import {
        useRoute,
        useRouter,
        onBeforeRouteUpdate,
    } from "vue-router";
    import { storeToRefs } from "pinia";

    import Header from "../components/Header.vue";
    import Loader from "../components/Loader.vue";

    import { useChatSessionsStore } from "../stores/chatSessions";
    import { useChatStore } from "../stores/chat";

    const ChatWindow = defineAsyncComponent({
        loader: () => import("../components/chat/ChatWindow.vue"),
        delay: 0,
    });

    const ChatSidebar = defineAsyncComponent({
        loader: () => import("../components/ChatsSidebar.vue"),
        delay: 0,
    });

    const route = useRoute();
    const router = useRouter();

    const chatSessionsStore = useChatSessionsStore();
    const chatStore = useChatStore();

    const { sessions } = storeToRefs(chatSessionsStore);

    const hasSessions = computed((): boolean => {
        return sessions.value.length > 0;
    });

    const handleSelectChat = async (chatId: string): Promise<void> => {
        if (chatId === route.params.id) {
            return;
        }

        await router.push({
            name: "chat",
            params: {
            id: chatId,
            },
        });
    };

    const initialize = async (): Promise<void> => {
        if (!sessions.value.length) {
            await chatSessionsStore.fetchSessions();
        }

        await chatStore.loadChatHistory(route.params.id as string);
    };

    onMounted(async (): Promise<void> => {
        await initialize();
    });

    onBeforeRouteUpdate(async (to): Promise<void> => {
        chatStore.reset();
        await chatStore.loadChatHistory(to.params.id as string);
    });
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-800 text-slate-200">
    <Header />

    <div class="flex-1 flex overflow-hidden">
      <main class="flex-1 overflow-hidden">
        <Suspense>
          <template #default>
            <ChatWindow />
          </template>

          <template #fallback>
            <Loader
              :show="true"
              overlay
              label="Loading chat..."
            />
          </template>
        </Suspense>
      </main>

      <aside
        v-if="hasSessions"
        class="hidden lg:block w-80 shrink-0"
      >
        <Suspense>
          <template #default>
            <ChatSidebar @select="handleSelectChat" />
          </template>

          <template #fallback>
            <Loader
              :show="true"
              overlay
              label="Loading chats..."
            />
          </template>
        </Suspense>
      </aside>
    </div>
  </div>
</template>