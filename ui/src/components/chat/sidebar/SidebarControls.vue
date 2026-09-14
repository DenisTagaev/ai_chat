<script setup lang="ts">
    defineProps<{
        collapsed: boolean;
        animating: boolean;
    }>();

    const emit = defineEmits<{
        (e: "new-chat", event: MouseEvent): void;
        (e: "toggle-collapse"): void;
    }>();
</script>

<template>
    <div
    class="sidebar-controls relative flex items-center overflow-hidden"
      :class="props.collapsed ? 'flex-col border-b border-slate-700 dark:border-slate-200' : 'justify-between'"
    >
      <span
        v-if="props.animating"
        class="sidebar-door sidebar-door-top bg-slate-200 dark:bg-slate-600"
        :class="{ 'sidebar-door-opening': !props.collapsed}"
        aria-hidden="true"
      ></span>
      <span
        v-if="props.animating && props.collapsed"
        class="sidebar-door sidebar-door-bottom bg-slate-200 dark:bg-slate-600"
        aria-hidden="true"
      ></span>

      <button
        type="button"
        class="group flex w-full items-center gap-2 px-3 py-2 text-left font-mono font-semibold tracking-wider transition-colors border-slate-700 dark:border-slate-200 backdrop-blur-lg hover:bg-slate-200 dark:hover:bg-slate-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 "
        :class="props.collapsed ? 'w-full justify-center' : 'flex-1'"
        @click="handleNewChat"
        :aria-label="props.collapsed ? 'New chat' : undefined"
      >
        <OhVueIcon name="gi-notebook" class="h-5 w-5 shrink-0 transition-transform text-slate-700 dark:text-slate-200 group-hover:scale-120" aria-hidden="true"/>
        <span v-if="!props.collapsed">New Chat</span>
      </button>

      <button
        type="button"
        class="group shrink-0 p-2 transition-colors backdrop-blur-md hover:bg-slate-200 dark:hover:bg-slate-600 hover:cursor-ew-resize focus:outline-none"
        :class="props.collapsed ? 'w-full justify-center' : ''"
        :aria-label="props.collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!props.collapsed"
        @click="emit('toggle-collapse')"
      >
        <OhVueIcon
          :name="props.collapsed ? 'bi-chevron-right' : 'bi-chevron-left'"
          class="h-5 w-5 shrink-0 transition-transform text-slate-700 dark:text-slate-200 group-hover:scale-120"
          aria-hidden="true"
        />
      </button>
    </div>
</template>