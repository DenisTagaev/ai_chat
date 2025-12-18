<script setup lang="ts">
    import { useUserStore } from '../stores/user';
    import { useRouter } from 'vue-router';
    import { useDark, useToggle } from '@vueuse/core';
    import { Sun, Moon, LogOutIcon } from 'lucide-vue-next';
    import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png';

    const userStore = useUserStore();
    const router = useRouter();
    const isDark = useDark();
    const toggleTheme = useToggle(isDark);

    const logout = () => {
        userStore.logout();
        router.push('/');
    }
</script>

<template>
    <nav class="py-4 px-6 bg-slate-100 dark:bg-slate-800 shadowm-md flex items-center justify-between" role="banner">
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
                @click="toggleTheme()"
                class="p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-700 transition"
                aria-label="Toggle theme"
            >
                <Sun v-if="!isDark" class="w-5 h-5" />
                <Moon v-else class="w-5 h-5" />
            </button>

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