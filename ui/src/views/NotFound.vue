<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
    <h1 class="text-7xl font-bold text-sky-500">404</h1>

    <p class="mt-4 text-xl text-slate-300">
      Page not found
    </p>

    <p class="mt-2 text-slate-400 text-center max-w-md">
      The page you’re looking for doesn’t exist or was moved.
    </p>

    <div class="mt-6 flex gap-4">
      <button
        @click="router.push('/')"
        class="px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition"
      >
        Go Home
      </button>

      <button
        @click="router.back()"
        class="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
      >
        Go Back
      </button>
    </div>
  </main>
</template>
