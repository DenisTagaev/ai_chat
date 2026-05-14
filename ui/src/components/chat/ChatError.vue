<script setup lang="ts">
  defineProps<{
    error: string
  }>()
</script>

<template>
  <div
    class="w-full flex justify-center"
    role="alert"
    aria-live="assertive"
  >
    <p
      class="bg-rose-600/30 border border-rose-500 text-white px-4 py-2 rounded-md max-w-lg text-sm"
    >
      {{ error }}
    </p>
  </div>
</template>
