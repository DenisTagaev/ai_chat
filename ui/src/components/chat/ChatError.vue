<script setup lang="ts">
  defineProps<{
    error: string
  }>()
</script>

<template>
    <div
      class="flex w-full justify-center px-2"
      role="alert"
      aria-live="assertive"
    >
      <div
        class="
          flex
          w-full
          max-w-2xl
          items-start
          gap-3
          rounded-md
          border
          border-rose-500/30
          bg-rose-950/40
          px-4
          py-3
          font-mono
          text-rose-400
          shadow-md
          shadow-rose-950/20
        "
      >
        <OhVueIcon
          name="bi-exclamation-triangle"
          class="mt-0.5 h-4 w-4 shrink-0 text-rose-400 animate-pulse"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <p
            class="
              mb-0.5
              text-[1.1em]
              font-semibold
              uppercase
              tracking-[0.2em]
            "
          >
            System Error
          </p>

          <p class="wrap-break-word text-md">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
</template>