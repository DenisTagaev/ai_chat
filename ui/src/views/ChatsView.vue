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

    const isSidebarCollapsed = ref(false);
    const isSidebarAnimating = ref(false);

    const route = useRoute();
    const router = useRouter();

    const chatSessionsStore = useChatSessionsStore();
    const chatStore = useChatStore();

    const { sessions } = storeToRefs(chatSessionsStore);

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
        if (!sessions.value.length) {
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

      <div
        v-if="isSidebarAnimating"
        class="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-999
          w-80
          overflow-hidden
        "
        aria-hidden="true"
      >
        <div
          class="
            absolute
            inset-0
            flex
            flex-col
            justify-around
            py-8
          "
          :class="isSidebarCollapsed ? 'animate-sidebar-collapse' : 'animate-sidebar-expand'"
        >
          <span
            class="h-2 w-[35%] self-end bg-sky-400/80"
            style="animation-delay: 0ms"
          />
          <span
            class="h-1 w-[65%] self-end bg-blue-400/60"
            style="animation-delay: 50ms"
          />
          <span
            class="h-px w-[90%] self-end bg-sky-300/80"
            style="animation-delay: 100ms"
          />
          <span
            class="h-2 w-[45%] self-end bg-blue-500/50"
            style="animation-delay: 150ms"
          />
          <span
            class="h-px w-[75%] self-end bg-sky-400/70"
            style="animation-delay: 200ms"
          />
          <span
            class="h-1 w-[30%] self-end bg-blue-400/60"
            style="animation-delay: 250ms"
          />
        </div>
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