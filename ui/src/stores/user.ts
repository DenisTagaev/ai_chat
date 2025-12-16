import { defineStore } from "pinia";

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
    isAuthenticated: (state) => !!state.userId,
  },

  actions: {
    setUser(data: { userId: string; name: string }): void {
      this.userId = data.userId;
      this.name = data.name;
    },
    logout(): void {
      this.$reset();
    },
  },
  persist: true, //keep user data for reloads
});