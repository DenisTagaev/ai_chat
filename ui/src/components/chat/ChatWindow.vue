<script setup lang="ts">
    import { defineAsyncComponent, nextTick, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '../../stores/user';
    import { useChatStore } from '../../stores/chat';

    import Header from '../Header.vue';
    import Loader from '../Loader.vue'

    const userStore = useUserStore();
    const chatStore = useChatStore();

    const router = useRouter();
    const route = useRoute();

    onMounted(async (): Promise<void> => {
        if(!userStore.userId) {
            router.replace('/');
            return;
        }

        const chatId = route.params.id as string | undefined;

        if (!chatId) {
            await router.replace("/chats");
            return;
        }

        chatStore.hydrateMessages();

        if(!chatStore.messages.length){
            await chatStore.loadChatHistory(chatId);
            await nextTick();
        }
    });

    const ChatContainer = defineAsyncComponent({
        loader: () => import('./ChatContainer.vue'),
        delay: 0,
    });
</script>

<template>
    <section class="flex flex-col h-screen bg-slate-900 text-slate-50">
        <Suspense>
            <template #default>
                <ChatContainer/>
            </template>

            <template #fallback>
                <Loader :show="true" overlay label="Loading..."/>
            </template>
        </Suspense>
    </section>
</template>