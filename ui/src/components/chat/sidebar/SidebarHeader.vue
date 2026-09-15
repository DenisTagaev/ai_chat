<script setup lang="ts">
  defineProps<{
    count: number;
    animating: boolean;
    opening: boolean;
  }>();
</script>

<template>
  <header
    class="flex items-center justify-between p-4 border-b border-slate-700 dark:border-slate-200 backdrop-blur-lg"
  >
    <span
      v-if="animating"
      class="sidebar-door sidebar-header-door bg-slate-200 dark:bg-slate-600"
      :class="{ 'sidebar-door-opening': opening }"
      aria-hidden="true"
    ></span>

    <h2
      id="recent-chats-heading"
      class="text-lg font-semibold font-mono tracking-wide uppercase text-shadow-slate-800 dark:text-slate-200"
    >
      Chats Log
    </h2>

    <span
      class="font-mono text-slate-500"
      aria-hidden="true"
    >
      {{ count }}
    </span>
  </header>
</template>