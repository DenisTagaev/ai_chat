<script setup lang="ts">
    defineProps<{ message?: string }>()
</script>

<template>
  <p
    v-if="message"
    class="text-center text-rose-600 mt-3"
    aria-live="polite"
    role="alert"
  >
    {{ message }}
  </p>
</template>
