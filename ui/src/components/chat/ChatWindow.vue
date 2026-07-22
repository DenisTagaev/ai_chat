<script setup lang="ts">
    import { computed, defineAsyncComponent, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '../../stores/user';
    import { useChatSessionsStore } from '../../stores/chatSessions';
    import { useChatStore } from '../../stores/chat.ts';

    import Loader from '../Loader.vue'
    import NewMessage from './NewMessage.vue';

    const userStore = useUserStore();
    const chatStore = useChatStore();
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

    const handleSend = async (message: string): Promise<void> => {
        if (selectedChatId.value) {
            await chatStore.sendAIRequest(selectedChatId.value, message);
            return;
        }

        const newChatId: string = (await chatSessionsStore.createSession(message)).chatId;
        await router.push({ name: 'AI chat', params: { chatId: newChatId } });

    };

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
    <section class="flex flex-col min-h-0 h-full bg-slate-900 text-slate-50">
        <Suspense>
            <template #default>
                <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div class="min-h-0 flex-1 overflow-hidden">
                        <ChatEmpty v-if="!selectedChatId" :has-chats="hasChats"/>
                        <ChatContainer v-else/>
                    </div>

                    <NewMessage :disabled="chatStore.isLoading" @send="handleSend"/>
                </div>
            </template>

            <template #fallback>
                <Loader :show="true" overlay label="Loading..."/>
            </template>
        </Suspense>
    </section>
</template>