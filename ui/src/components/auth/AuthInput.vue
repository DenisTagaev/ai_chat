<script setup lang="ts">
    defineProps<{
        modelValue: string
        type?: string
        placeholder: string
        disabled?: boolean
        autocomplete?: string
    }>()

    defineEmits(['update:modelValue'])
</script>

<template>
  <label>
    <span class="sr-only">Name</span>
    <input
      :type="type || 'text'"
      class="w-full rounded-lg border border-slate-700 bg-slate-800 mb-1 px-4 py-3 font-mono text-slate-100 placeholder:text-slate-500 transition focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      required
    />
  </label>
</template>
