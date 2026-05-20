<script setup lang="ts">
    import Loader from '../components/Loader.vue'
    import { isRouteLoading } from '../composables/useRouteLoading'
</script>

<template>
    <Loader
      :show="isRouteLoading"
      overlay
      label="Loading…"
    />
    <RouterView/>
</template>
