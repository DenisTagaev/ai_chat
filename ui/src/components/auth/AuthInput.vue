<script setup lang="ts">
import { ref } from 'vue';

    defineProps<{
        id: string
        modelValue: string
        type?: string
        placeholder: string
        disabled?: boolean
        autocomplete?: string
    }>()

    const isFocused = ref(false);

    defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative">
    <span class="sr-only">Name</span>
    <input
      :id="id"
      :type="type || 'text'"
      class="peer w-full rounded-lg border border-slate-700 bg-slate-800 mb-2 px-4 py-3 font-mono text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      placeholder=""
      :disabled="disabled"
      :autocomplete="autocomplete"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
      required
    />
    <label
        :for="id"
        :class="{
          '-top-3 text-emerald-500': isFocused,
          'hidden': modelValue && !isFocused,
        }"
        class="
            pointer-events-none
            absolute
            left-3
            top-3
            origin-left
            bg-slate-800
            px-2
            tracking-wide
            font-mono
            text-md
            text-slate-400
            transition-[top, transform, color]
            duration-200
            peer-focus:-top-3
            peer-focus:bg-slate-800
            peer-focus:text-emerald-500
            peer-focus:rounded-sm
            peer-[:not(:placeholder-shown)]:-top-3"
    >
        {{ placeholder }}
        <span
          v-if="isFocused"
          class="absolute rounded inset-x-0 -bottom-px h-0.5 bg-emerald-500"
        />
    </label>
  </div>
</template>
