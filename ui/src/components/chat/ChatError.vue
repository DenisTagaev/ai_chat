<script setup lang="ts">
  defineProps<{
    error: string
  }>()
</script>

<template>
  <div
    class="text-center text-rose-500 text-sm"
    role="alert"
    aria-live="assertive"
  >
    <p>{{ error }}</p>
  </div>
</template>
