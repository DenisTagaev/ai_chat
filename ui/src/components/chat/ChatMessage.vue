<script setup lang="ts">
    import { computed } from 'vue'
    import { useMessageFormatter } from '../../composables/useMessageFormatter'

    const props = defineProps<{
        role: 'user' | 'model'
        content: string
    }>()

    const { format } = useMessageFormatter()

    const formattedContent = computed(
        () => {
          if(!props.content) return "";
          return props.role === "model"
            ? format(props.content)
            : props.content
        }
    )
</script>

<template>
  <div
    class="max-w-xs md:max-w-md px-4 py-2 rounded text-slate-100"
    :class="role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-slate-700 mr-auto'"
    v-html="formattedContent"
  />
</template>
