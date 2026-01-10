<script setup lang="ts">
    defineProps<{
        loading?: boolean
    }>()
</script>

<template>
  <button
    type="submit"
    class="w-full p-2 bg-sky-600 rounded-lg font-medium transition-opacity disabled:opacity-60"
    :disabled="loading"
    :aria-busy="loading"
  >
    <slot />
  </button>
</template>
