<script setup lang="ts">
    defineProps<{
    show: boolean
    label?: string
    overlay?: boolean
    size?: number
    }>()
</script>

<template>
  <div
    v-show="show"
    :class="[
      overlay
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        : 'inline-flex items-center justify-center'
    ]"
    aria-live="polite"
    :aria-busy="show ? 'true' : 'false'"
  >
    <div class="flex flex-col items-center gap-3">
      <span
        class="loader border-2 border-white rounded-full inline-block relative box-border animate-spin"
        :style="{
          width: `${size ?? 48}px`,
          height: `${size ?? 48}px`,
        }"
        aria-hidden="true"
      />
      <span v-if="label" class="text-sm text-slate-200">{{ label }}</span>
    </div>
  </div>
</template>

<style>
    .loader::after,
    .loader::before {
        content: "";
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: 0;
        background: #ff3d00;
        width: 6px;
        height: 6px;
        transform: translate(150%, 150%);
        border-radius: 9999px;
    }
    .loader::before {
        left: auto;
        top: auto;
        right: 0;
        bottom: 0;
        transform: translate(-150%, -150%);
    }
</style>
