import { ref, watch } from "vue";

export function useAuthForm() {
  const name = ref("");
  const email = ref("");
  const error = ref("");
  const loading = ref(false);

  const validate = (): string | null => {
    const trimmedName: string = name.value.trim();
    const normalizedEmail: string = email.value.trim().toLowerCase();

    if (!trimmedName) return "Name is required.";

    if (!normalizedEmail) return "Email is required.";

    if(trimmedName.length > 100) return "Name is too long"

    if(normalizedEmail.length > 128) return "Email is too long"

    if (!/^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)*\.[^\s@]{2,}$/.test(normalizedEmail))
      return "Please enter a valid email address.";
    return null;
  };

  watch([name, email], () => {
    if (error.value) error.value = "";
  });

  return {
    name,
    email,
    error,
    loading,
    validate,
  };
}
