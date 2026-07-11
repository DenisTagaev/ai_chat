<script setup lang="ts">
    import { computed, defineAsyncComponent, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '../../stores/user';
    import { useChatSessionsStore } from '../../stores/chatSessions';

    import Loader from '../Loader.vue'

    const userStore = useUserStore();
    const chatSessionsStore = useChatSessionsStore();

    const router = useRouter();
    const route = useRoute();

    const selectedChatId = computed<string | null>((): string | null => {
        const value = route.params.chatId;

        return typeof value === 'string' ? value : null;
    });

    const hasChats = computed<boolean>((): boolean => {
        return chatSessionsStore.sessions.length > 0;
    });

    onMounted(async (): Promise<void> => {
        if(!userStore.userId) {
            await router.replace('/');
        }
    });

    const ChatContainer = defineAsyncComponent({
        loader: () => import('./ChatContainer.vue'),
        delay: 0,
    });

    const ChatEmpty = defineAsyncComponent({
        loader: () => import('./ChatEmpty.vue'),
        delay: 0,
    });
</script>

<template>
    <section class="flex flex-col h-screen bg-slate-900 text-slate-50">
        <Suspense>
            <template #default>
                <ChatEmpty v-if="!selectedChatId" :has-chats="hasChats"/>
                <ChatContainer v-else/>
            </template>

            <template #fallback>
                <Loader :show="true" overlay label="Loading..."/>
            </template>
        </Suspense>
    </section>
</template>