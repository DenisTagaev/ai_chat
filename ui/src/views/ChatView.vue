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

        <!-- <div ref="chatSectionRef" id="chat-section" class="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
            <div v-for="(msg, index) in chatStore.messages" :key="index" class="flex items-start" :class="msg.role === 'user' ? 'justify-end': 'justify-start'">
                <div :v-html="msg.role === 'model' ? formatAIText(msg.content) : msg.content" v-memo="[msg.content]" class="max-w-xs px-4 py-2 rounded md:max-w-md text-slate-100" :class="msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'">
                    {{ msg.content }}
                </div>
            </div>
            <p v-if="chatStore.error" class="text-center text-rose-600">
                {{ chatStore.error }}
            </p>
            <div v-if="chatStore.isLoading" class="flex justify-start">
                <div class="bg-slate-700 text-white px-4 py-2 rounded-md">
                    <span class="animate-pulse">AI assistant is thinking...</span>
                </div>
            </div>
        </div> -->

        <ChatContainer/>
    </section>
</template>