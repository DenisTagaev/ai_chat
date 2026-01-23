<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import Loader from '../components/Loader.vue'
  import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png'

  const AuthForm = defineAsyncComponent({
    loader: () => import('../components/auth/AuthForm.vue'),
    delay: 0,
  });
</script>

<template>
  <main
    class="min-h-screen flex items-center justify-center bg-gray-800 text-slate-200"
  >
    <Suspense>
      <template #default>
        <section
          class="p-8 bg-gray-700 rounded-lg shadow-lg w-full max-w-md"
          aria-labelledby="page-login"
        >
          <img
            :src="chatImage"
            alt="AI assistant avatar"
            class="mx-auto w-24 h-24 mb-4"
            loading="lazy"
            decoding="async"
          />
          <h1
            id="page-title"
            class="text-2xl font-semibold mb-4 text-center"
          >
            Welcome to your personal AI assistant
          </h1>
          <AuthForm />
        </section>
      </template>

      <template #fallback>
        <Loader :show="true" overlay label="Loading..."/>
      </template>
    </Suspense>
  </main>
</template>
