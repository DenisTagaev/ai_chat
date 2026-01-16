import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { router } from './router'
import { registerSW } from "virtual:pwa-register";
import './style.css'
import App from './App.vue'

const app = createApp(App);

const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedState)

app.use(pinia);
app.use(router);
app.mount('#app');

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New version available");
  },
  onOfflineReady() {
    console.log("App ready for offline use");
  },
});