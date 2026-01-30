<script setup lang="ts">
    import { defineAsyncComponent, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '../stores/user';
    import { useChatStore } from '../stores/chat';
    import Header from '../components/Header.vue';
    import Loader from '../components/Loader.vue'

    const userStore = useUserStore();
    const chatStore = useChatStore();
    const router = useRouter();

    onMounted(async (): Promise<void> => {
        if(!userStore.userId) {
            router.replace('/');
            return;
        }

        chatStore.hydrateMessages();

        if(!chatStore.messages.length){
            await chatStore.loadChatHistory();
        }
    });

    const ChatContainer = defineAsyncComponent({
        loader: () => import('../components/chat/ChatContainer.vue'),
        delay: 0,
    });
</script>

<template>
    <section class="flex flex-col h-screen bg-slate-900 text-slate-50">
        <Header/>
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