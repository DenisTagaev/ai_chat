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
    <nav class="py-4 px-6 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-between"
        role="navigation"
        aria-label="Main navigation"
    >
        <div class="flex items-center gap-2">
            <div
                class="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/30 dark:bg-slate-800 bg-slate-100 shadow-sm shadow-emerald-500/10"
                aria-hidden="true"
            >
                <img
                :src="chatImage"
                class="w-8 h-8"
                alt="AI bot avatar"
                loading="lazy"
                decoding="async"
                />
            </div>
            <div class="flex flex-col">
                <h1
                    class="font-mono text-lg font-semibold uppercase tracking-[0.2em] dark:text-slate-100"
                >
                    AI Assistant
                </h1>

                <div class="flex items-center gap-1.5">
                    <span
                        class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                        aria-hidden="true"
                    />
                    <span
                        class="font-mono text-[9px] uppercase tracking-widest text-emerald-500"
                    >
                        Online
                    </span>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <button
                @click="logout"
                type="button"
                class="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    border-transparent
                    px-3
                    py-2
                    font-mono
                    text-xs
                    uppercase
                    tracking-widest
                    text-slate-400
                    transition-colors
                    hover:border-rose-500/30
                    hover:bg-rose-500/5
                    hover:text-rose-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-rose-500/40
                "
                aria-label="Logout"
            >
            <LogOutIcon class="w-4 h-4 transition-colors" aria-hidden="true"/>
                <span class="hidden md:inline">
                    Logout
                </span>
            </button>
        </div>
    </nav>
</template>