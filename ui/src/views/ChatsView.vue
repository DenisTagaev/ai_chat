<script setup lang="ts">
    import {
        defineAsyncComponent,
        onMounted,
        ref,
    } from "vue";
    import {
        useRoute,
        useRouter,
        onBeforeRouteUpdate,
    } from "vue-router";

    import Header from "../components/Header.vue";
    import Loader from "../components/Loader.vue";

    import { useChatSessionsStore } from "../stores/chatSessions";
    import { useChatStore } from "../stores/chat";

    const ChatWindow = defineAsyncComponent({
        loader: () => import("../components/chat/ChatWindow.vue"),
        delay: 0,
    });

    const ChatSidebar = defineAsyncComponent({
        loader: () => import("../components/chat/sidebar/ChatsSidebar.vue"),
        delay: 0,
    });

    const isSidebarCollapsed = ref(false);
    const isSidebarAnimating = ref(false);

    const route = useRoute();
    const router = useRouter();

    const chatSessionsStore = useChatSessionsStore();
    const chatStore = useChatStore();

    const handleSelectChat = async (chatId: string): Promise<void> => {
        if (chatId === route.params.chatId) {
            return;
        }

        await router.push({
            name: "AI chat",
            params: {
              chatId,
            },
        });
    };

    const handleSidebarAnimation = (): void => {
        if (isSidebarAnimating.value) {
          return;
        }

        isSidebarAnimating.value = true;
        isSidebarCollapsed.value = !isSidebarCollapsed.value;

        window.setTimeout(() => {
          isSidebarAnimating.value = false;
        }, 500);
    };

    const initialize = async (): Promise<void> => {
        if (!chatSessionsStore.hasFetchedSessions && !chatSessionsStore.isLoading) {
            await chatSessionsStore.fetchSessions();
        }

        await chatStore.loadChatHistory(route.params.chatId as string);
    };

    onMounted(async (): Promise<void> => {
        await initialize();
    });

    onBeforeRouteUpdate(async (to): Promise<void> => {
        chatStore.reset();
        await chatStore.loadChatHistory(to.params.chatId as string);
    });
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-800 text-slate-200">
    <Header />

    <div class="flex-1 flex overflow-hidden">
      <div
        class="relative shrink-0 transition-[width] duration-500 ease-in-out"
        :class="isSidebarCollapsed ? 'w-16' : 'w-80'"
      >
        <aside class="h-full overflow-hidden">
          <Suspense>
            <template #default>
              <ChatSidebar
                :collapsed="isSidebarCollapsed"
                :animating="isSidebarAnimating"
                @select="handleSelectChat"
                @toggle-collapse="handleSidebarAnimation"
              />
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

      <main class="flex-1 min-w-0 overflow-hidden">
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
    </div>
  </div>
</template>