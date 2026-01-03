<script setup lang="ts"></script>

<template>
  <output
    class="flex justify-start"
    aria-live="polite"
    aria-label="AI assistant is typing"
  >
    <div class="bg-slate-700 text-white px-4 py-2 rounded-md">
      <span class="animate-pulse">
        AI assistant is thinking…
      </span>
    </div>
  </output>
</template>
