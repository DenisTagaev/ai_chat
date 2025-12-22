<script setup lang="ts">
    import { onMounted, nextTick } from 'vue';
    import { useUserStore } from '../stores/user';
    import { useChatStore } from '../stores/chat';
    import { useRouter } from 'vue-router';
    import Header from '../components/Header.vue';

    const userStore = useUserStore();
    const chatStore = useChatStore();
    const router = useRouter();

    const scrollToBottom = (): void => {
        nextTick((): void => {
            const chatSection: Element | null = document.querySelector('#chat-section');
            if(chatSection) chatSection.scrollTop = chatSection.scrollHeight;
        });
    }

    onMounted((): void => {
        chatStore.loadChatHistory().then((): void => scrollToBottom());
    })
</script>

<template>
    <section class="flex flex-col h-screen bg-slate-900 text-slate-50">
        <Header/>

        <div id="chat-section" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-for="(msg, index) in chatStore.messages" :key="index" class="flex items-start" :class="msg.role === 'user' ? 'justify-end': 'justify-start'">
                <div class="max-w-xs px-4 py-2 rounded md:max-w-md" :class="msg.role === 'user' ? 'bg-blue-500 text-slate-100' : 'bg-slate-700 text-slate-100'"></div>
            </div>
        </div>
    </section>
</template>