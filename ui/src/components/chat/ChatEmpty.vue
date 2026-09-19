<script setup lang="ts">
    defineProps<{
        hasChats?: boolean;
    }>();
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-6 text-center sm:px-6">
    <h1
      class="mb-3 max-w-xs sm:max-w-md text-xl sm:text-3xl font-mono font-semibold text-gray-900 dark:text-slate-100"
    >
      Welcome to your personal AI Assistant
    </h1>

    <p
      class="max-w-xs sm:max-w-md text-md sm:text-base font-sans text-gray-600 dark:text-slate-400"
    >
      {{
        hasChats
          ? "Select a conversation from the sidebar to continue chatting."
          : "Start your first conversation using the New Chat button in the sidebar."
      }}
    </p>
  </div>
</template>