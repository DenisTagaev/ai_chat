<script setup lang="ts">
    import { useUserStore } from '../stores/user';
    import { useRouter } from 'vue-router';
    import { LogOutIcon } from 'lucide-vue-next';
    import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png';

    const userStore = useUserStore();
    const router = useRouter();

    const logout = () => {
        userStore.logout();
        router.push('/');
    }
</script>

<template>
    <nav class="py-4 px-6 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-between" role="navigation">
        <div class="flex items-center gap-2">
            <img
                :src="chatImage"
                class="w-8 h-8"
                alt="AI bot image"
                loading="lazy"
                decoding="async"
            />
            <h1 class="text-lg font-semibold dark:text-slate-100">AI Assistant</h1>
        </div>
        <div class="flex items-center gap-3">
            <button
                @click="logout"
                class="flex items-center gap-2 text-slate-300 hover:text-rose-400 transition font-medium"
                aria-label="Logout"
            >
            <LogOutIcon class="w-4 h-4"/>
                <span class="hidden md:inline">
                    Logout
                </span>
            </button>
        </div>
    </nav>
</template>