<script setup lang="ts">
    import AuthForm from '../components/auth/AuthForm.vue'
    import chatImage from '../assets/pngtree-chatbot-messenger-concept-design-man-and-woman-chatting-using-chatbots-assistant-png-image_3829211-removebg-preview.png'
</script>

<template>
  <main
    class="min-h-screen flex items-center justify-center bg-gray-800 text-slate-200"
  >
    <section
      class="p-8 bg-gray-700 rounded-lg shadow-lg w-full max-w-md"
      aria-labelledby="page-login"
    >
      <img
        :src="chatImage"
        alt="AI assistant avatar"
        class="mx-auto w-24 h-24 mb-4"
        loading="lazy"
        decoding="async"
      />

      <h1
        id="page-title"
        class="text-2xl font-semibold mb-4 text-center"
      >
        Welcome to your personal AI assistant
      </h1>

      <AuthForm />
    </section>
  </main>
</template>
