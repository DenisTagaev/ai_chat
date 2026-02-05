import { defineStore } from "pinia";
import { useChatStore } from "./chat";

interface UserState {
  userId: string | null;
  name: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    userId: null as string | null,
    name: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => typeof state.userId === 'string' && state.userId.length > 0,
  },

  actions: {
    setUser(data: { userId: string; name: string }): void {
      this.userId = data.userId.trim() || null;
      this.name = data.name.trim() || null;
    },
    logout(): void {
      this.$reset();

      const chatStore = useChatStore();
      chatStore.reset();
    },
  },
  persist: true, //keep user data for reloads
});