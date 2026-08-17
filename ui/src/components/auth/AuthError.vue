<script setup lang="ts">
    defineProps<{ message?: string }>()
</script>

<template>
  <p
    v-if="message"
    class="text-center font-mono tracking-wide outline-none text-rose-600 mt-3"
    aria-live="polite"
    role="alert"
  >
    <OhVueIcon name="md-error-outline-round" class="mr-2"/>
    {{ message }}
  </p>
</template>