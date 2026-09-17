<script setup lang="ts">
  defineProps<{
    collapsed: boolean;
  }>();
</script>

<template>
  <div
    v-if="collapsed"
    class="group flex flex-1 flex-col items-center justify-center gap-2 px-1 text-center hover:text-slate-600 dark:hover:text-slate-200"
    title="No recent chats. Click New Chat to begin."
    aria-label="No recent chats. Click New Chat to begin."
  >
    <OhVueIcon
      name="gi-chat-bubble"
      class="h-5 w-5 text-slate-500 dark:text-slate-400"
      aria-hidden="true"
    />

    <span
      class="h-1 w-1 rounded-full bg-slate-500 dark:bg-slate-400"
      aria-hidden="true"
    />

    <span
      class="font-mono text-[0.83em] leading-relaxed uppercase tracking-wider text-slate-400 dark:text-slate-500 [writing-mode:vertical-rl]"
    >
      No chats
    </span>
  </div>

  <div
    v-else
    class="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center"
  >
    <h3
      class="font-mono text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200"
    >
      No recent chats available
    </h3>

    <p
      class="p-4 text-medium text-center italic text-slate-500 dark:text-slate-400"
    >
      You haven't started any chats yet. Click the
      <span
        class="group hover:cursor-pointer hover:font-semibold hover:text-slate-600 dark:hover:text-slate-200"
      >
        <OhVueIcon
          name="gi-notebook"
          class="h-5 w-5 shrink-0 text-slate-700 transition-transform group-hover:scale-120 dark:text-slate-200"
          aria-hidden="true"
        />
        New Chat
      </span>
      to begin a conversation.
    </p>
  </div>
</template>