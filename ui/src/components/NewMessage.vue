<script setup lang="ts">
    import { ref } from 'vue';

    const message = ref('');
    const emit = defineEmits(['send']);

    const sendMessage = (): void => {
        if(!message.value.trim()) return;
        emit('send', message.value);
        message.value='';
    }
</script>

<template>
    <section class="p-4 bg-slate-700 flex">
        <input v-model="message" placeholder="Send message to AI" @keyup.enter="sendMessage" type="text" class="flex-1 p-2 rounded-md bg-slate-500 text-white focus:outline-none"/>
        <button @click="sendMessage" class="ml-2 px-4 py-2 bg-blue-500 rounded-md">
            Send
        </button>
    </section>
</template>