<script setup lang="ts">
    defineProps<{
        loading?: boolean
    }>()
</script>

<template>
  <button
    type="submit"
    class="w-full mt-6 px-5 py-3 bg-sky-600 border border-sky-500/50 rounded-lg font-mono font-semibold uppercase tracking-widest transition hover:bg-sky-500 hover:shadow-md hover:shadow-sky-500/20 hover:text-slate-200 disabled:opacity-50"
    :disabled="loading"
    :aria-busy="loading"
  >
    <OhVueIcon name="bi-robot" class="mr-2"/>
    <slot />
  </button>
</template>
