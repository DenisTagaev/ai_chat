<template>
  <div
    class="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center"
  >
    <h3 class="font-mono text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        No recent chats available
    </h3>
    <p class="p-4 text-medium text-center italic text-slate-500 dark:text-slate-400">
        <OhVueIcon
            name="oi-cross-reference"
            class="h-10 w-10"
            aria-hidden="true"
        />
        You haven't started any chats yet. Click the "New Chat" button to begin a conversation.
    </p>
  </div>
</template>