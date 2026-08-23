<script setup lang="ts"></script>

<template>
  <output
    class="flex justify-start"
    aria-live="polite"
    aria-label="AI assistant is thinking"
  >
    <div
      class="
        flex
        items-center
        gap-3
        rounded-lg
        border
        border-emerald-500/20
        bg-slate-800/80
        px-4
        py-3
        font-mono
        shadow-sm
        shadow-emerald-500/5
      "
    >
      <div class="flex items-center gap-1" aria-hidden="true">
        <span
          class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
        />
        <span
          class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:150ms]"
        />
        <span
          class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:300ms]"
        />
      </div>

      <span class="text-[11px] uppercase tracking-[0.18em] text-emerald-400/80">
        Processing
      </span>
    </div>
  </output>
</template>
