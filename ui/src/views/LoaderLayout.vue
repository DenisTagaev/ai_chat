<script setup lang="ts">
    import Loader from '../components/Loader.vue'
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-800">
    <Loader
      :show="true"
      overlay
      label="Loading…"
    />
  </main>
</template>
