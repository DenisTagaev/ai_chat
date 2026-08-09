<script setup lang="ts">
    import { computed, type ComputedRef } from 'vue'
    import { useMessageFormatter } from '../../composables/useMessageFormatter'

    const props = defineProps<{
        role: 'user' | 'model'
        content: string
    }>()

    const { format } = useMessageFormatter()

    const formattedContent: ComputedRef<string> = computed(
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
        class="flex w-full"
        :class="role === 'user' ? 'justify-end' : 'justify-start'"
    >
        <article
            class="group relative max-w-xs md:max-w-md lg:max-w-2xl"
            :class="role === 'user' ? 'ml-auto' : 'mr-auto'"
        >
            <div
                class="mb-1 flex items-center gap-2 px-1 text-[10px] font-mono font-semibold uppercase tracking-[0.2em]"
                :class="
                    role === 'user'
                        ? 'justify-end text-blue-400'
                        : 'justify-start text-emerald-400'
                "
            >
                <OhVueIcon
                    :name="role === 'user' ? 'bi-person-badge-fill' : 'bi-robot'"
                    class="h-4 w-4"
                    aria-hidden="true"
                />

                <span>
                    {{ role === "user" ? "YOU" : "AI ASSISTANT" }}
                </span>

                <span
                    class="h-1 w-1 rounded-full"
                    :class="
                        role === 'user'
                            ? 'bg-blue-400'
                            : 'bg-emerald-400'
                    "
                    aria-hidden="true"
                />
            </div>

            <div
                class="relative border px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-lg"
                :class="
                    role === 'user'
                        ? [
                            'border-blue-500/40',
                            'bg-slate-800/90',
                            'rounded-tl-xl rounded-bl-xl rounded-br-sm',
                            'shadow-blue-950/20',
                        ]
                        : [
                            'border-emerald-500/30',
                            'bg-slate-800/70',
                            'rounded-tr-xl rounded-br-xl rounded-bl-sm',
                            'shadow-emerald-950/10',
                        ]
                "
            >
              <div
                  v-html="formattedContent"
                  class="wrap-break-words"
              />
            </div>
        </article>
    </div>
</template>
