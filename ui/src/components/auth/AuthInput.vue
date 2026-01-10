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
  <input
    :type="type || 'text'"
    class="w-full p-2 mb-2 bg-gray-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
