<script setup lang="ts">
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '../../stores/user'
    import { useAuthForm } from '../../composables/useAuthForm'

    import AuthInput from './AuthInput.vue'
    import AuthButton from './AuthButton.vue'
    import AuthError from './AuthError.vue'

    const router = useRouter();
    const userStore = useUserStore();

    const {
        name,
        email,
        loading,
        error,
        validate
    } = useAuthForm();

    const submit = async (): Promise<void> => {
        error.value = '';
        loading.value = true;

        const validationError = validate();

        if (validationError) {
            error.value = validationError;
            loading.value = false;
            return;
        }

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/auth`,
                { name: name.value.trim(), email: email.value.trim().toLowerCase() }
            );

            if (!data?.user?.id || !data?.user?.name) {
                throw new Error("Invalid server response");
            }

            userStore.setUser({
                userId: data.user.id,
                name: data.user.name
            });

            await router.push('/chats');
        } catch {
            error.value = 'Something went wrong. Please try again.';
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
  <form @submit.prevent="submit" novalidate>
    <AuthInput
      v-model="name"
      placeholder="Name"
      autocomplete="name"
      :disabled="loading"
    />

    <AuthInput
      v-model="email"
      type="email"
      placeholder="Email"
      autocomplete="email"
      :disabled="loading"
    />

    <AuthButton :loading="loading">
      {{ loading ? 'Connecting...' : 'Initialize session' }}
    </AuthButton>

    <AuthError :message="error" />
  </form>
</template>
