<script setup lang="ts">
    import { useUserStore } from '../stores/user';
    import { useRouter } from 'vue-router';
    import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png';

    const userStore = useUserStore();
    const router = useRouter();
</script>

<template>
    <section class="py-4 px-6 bg-slate-800 shadowm-md flex justify-between">
        <img
            :src="chatImage"
            class="w-8 h-8"
            alt="AI bot image"
            loading="lazy"
            decoding="async"
        />
        <h1 class="text-lg font-semibold">AI Assistant</h1>
        <button @click="logout" class="text-slate-400 hover:text-slate-100">Logout</button>
    </section>
</template>