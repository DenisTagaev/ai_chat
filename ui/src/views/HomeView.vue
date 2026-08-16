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
          class="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur-xl shadow-2xl"
          aria-labelledby="page-title"
        >
          <div class="border-b border-dashed border-slate-700 px-8 py-6">
            <div class="mb-3 flex items-center justify-center">
              <div class="rounded-full border border-emerald-500 bg-slate-800 p-4">
                <img
                  :src="chatImage"
                  alt="AI assistant avatar"
                  class="h-24 w-24"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div class="text-center">
              <div class="mb-4 flex items-center justify-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p
                  class="font-mono text-sm uppercase tracking-[0.35em] text-emerald-500"
                >
                  AI CORE ONLINE
                </p>
              </div>

              <h1
                id="page-title"
                class="text-3xl font-semibold tracking-tight text-slate-100"
              >
                Personal AI Assistant
              </h1>

              <p class="mt-3 text-sm text-slate-400">
                Authenticate to start a secure conversation.
              </p>
            </div>
          </div>

          <div class="p-8">
              <AuthForm />
          </div>
        </section>
      </template>

      <template #fallback>
        <Loader :show="true" overlay label="Loading..."/>
      </template>
    </Suspense>
  </main>
</template>
