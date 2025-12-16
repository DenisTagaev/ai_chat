<script setup lang="ts">
    import { ref, type Ref } from 'vue';
    import { useUserStore } from '../stores/user';
    import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png';

    const userStore = useUserStore();
    const name: Ref<string, string> = ref('');
    const email: Ref<string, string> = ref('');
    const loading: Ref<boolean, boolean> = ref(false);
    const error: Ref<string, string> = ref('');

    function validateUserInput(name: string, email: string): string | null {
        const trimmedName: string = name.trim();
        const trimmedEmail: string = email.trim();

        if (!trimmedName && !trimmedEmail) {
            return "Name and email are required.";
        }

        if (!trimmedName) {
            return "Name is required.";
        }

        if (!trimmedEmail) {
            return "Email is required.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        return null;
    }
    const createUser = async () => {
        error.value = "";

        const validationError: string | null = validateUserInput(name.value, email.value);

        if (validationError) {
            error.value = validationError;
            return;
        }

        try {
            loading.value = true;
            // TODO: backend call
        } catch {
            error.value = "Something went wrong. Please try again.";
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
    <main class="min-h-screen flex items-center justify-center bg-gray-800 text-slate-200">
        <section class="p-8 bg-gray-700 rounded-lg shadow-lg w-full max-w-md" aria-labelledby="page-login">
            <img
                :src="chatImage"
                alt="AI bot image"
                class="mx-auto w-24 h-24 mb-4"
                loading="lazy"
                decoding="async"
            >
            <h1
                id="page-title"
                class="text-2xl font-semibold mb-4 text-center text-slate-200"
            >
                Welcome to your personal AI assistant
            </h1>
            <form @submit.prevent="createUser" novalidate>
                 <div class="mt-3">
                    <label for="name" class="sr-only">Name</label>
                    <input
                        id="name"
                        type="text"
                        class="w-full p-2 mb-2 bg-gray-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        name="name"
                        placeholder="Name"
                        v-model.trim="name"
                        :disabled="loading"
                        autocomplete="name"
                        required
                    >
                </div>

                <div class="mb-4">
                    <label for="email" class="sr-only">Email</label>
                    <input
                        id="email"
                        type="email"
                        class="w-full p-2 mb-2 bg-gray-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        name="name"
                        placeholder="Email"
                        :disabled="loading"
                        v-model.trim="email"
                        autocomplete="email"
                        required
                    >
                </div>

                <button
                    type="submit"
                    class="w-full p-2 bg-sky-600 rounded-lg font-medium transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="loading"
                    :aria-busy="loading"
                >
                    {{  loading ? "Connecting to bot..." : "Start chat" }}
                </button>

                <p v-if="error" class="text-center text-rose-600 mt-3" role="alert">{{ error }}</p>
            </form>
        </section>
    </main>
</template>