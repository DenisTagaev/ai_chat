import { ref } from "vue";

export function useAuthForm() {
  const name = ref("");
  const email = ref("");
  const loading = ref(false);
  const error = ref("");

  const validate = () => {
    if (!name.value.trim() && !email.value.trim())
      return "Name and email are required.";

    if (!name.value.trim()) return "Name is required.";

    if (!email.value.trim()) return "Email is required.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
      return "Please enter a valid email address.";

    return null;
  };

  return {
    name,
    email,
    loading,
    error,
    validate,
  };
}
