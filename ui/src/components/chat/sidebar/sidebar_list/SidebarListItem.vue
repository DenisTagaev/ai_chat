<script setup lang="ts">
    import type { ChatSession } from '../../../../services/sessionsService';

    const props = defineProps<{
        session: ChatSession;
        index: number;
        currentChatId: string;
        collapsed: boolean;
        animating: boolean;
    }>();

    const emit = defineEmits<{
        (e: "select", chatId: string): void;
    }>();

    const formatDate = (isoDate: string): string => {
        const date = new Date(isoDate);

        return new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
        }).format(date);
    };
</script>

<template>
  <li
    class="sidebar-chat-item relative min-w-0 overflow-hidden"
    :style="{ '--item-index': props.index }"
  >
    <span
      v-if="props.animating"
      class="sidebar-chat-door bg-slate-200 dark:bg-slate-600"
      :class="{ 'sidebar-chat-door-opening': !props.collapsed }"
      aria-hidden="true"
    ></span>

    <button
      type="button"
      class="
        group
        relative
        flex
        w-full
        min-w-0
        px-2
        py-3
        rounded-md
        bg-transparent
        transition-colors
        duration-200
        hover:bg-slate-200
        dark:hover:bg-slate-600
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/70
        focus:ring-inset-1
        focus:ring-inset-sky-600
      "
      :class="{
        'bg-slate-200 text-slate-800 ring-1 ring-blue-500/70 shadow-sm dark:bg-slate-800 dark:text-slate-200':
          props.session.chatId === props.currentChatId,
        'justify-center': props.collapsed,
        'flex-col text-left': !props.collapsed,
      }"
      :aria-current="
        props.session.chatId === props.currentChatId ? 'page' : undefined
      "
      :aria-label="props.collapsed ? props.session.title : undefined"
      @click="emit('select', props.session.chatId)"
    >
      <span
        v-if="props.session.chatId === props.currentChatId"
        class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-sky-600"
        aria-hidden="true"
      />

      <OhVueIcon
        v-if="props.collapsed"
        name="gi-chat-bubble"
        class="sidebar-chat-icon h-5 w-5 shrink-0 transition-transform text-slate-700 dark:text-slate-200 group-hover:scale-120 hover:cursor-pointer"
        aria-hidden="true"
      />

      <template v-else>
        <span
          class="sidebar-chat-title min-w-0 pr-2 font-mono font-medium truncate text-sm"
          :class="
            props.session.chatId === props.currentChatId
              ? 'text-blue-500 group-hover:text-blue-300'
              : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-100'
          "
        >
          {{ props.session.title }}
        </span>

        <span
          class="sidebar-chat-date font-mono tracking-wide text-xs text-slate-600 mt-1 dark:text-slate-400 group-hover:text-slate-200"
        >
          {{ formatDate(props.session.updatedAt) }}
        </span>
      </template>
    </button>
  </li>
</template>