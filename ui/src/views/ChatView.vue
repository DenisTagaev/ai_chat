<script setup lang="ts">
    import { onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '../stores/user';
    import { useChatStore } from '../stores/chat';
    import Header from '../components/Header.vue';
    import ChatContainer from '../components/chat/ChatContainer.vue';

    const userStore = useUserStore();
    const chatStore = useChatStore();
    const router = useRouter();

    onMounted(async (): Promise<void> => {
        if(!userStore.userId) {
            router.replace('/');
            return;
        }

        await chatStore.loadChatHistory();
    });
</script>

<template>
    <section class="flex flex-col h-screen bg-slate-900 text-slate-50">
        <Header/>
        <ChatContainer/>
    </section>
</template>