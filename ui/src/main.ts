import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { router } from './router'
import './style.css'
import App from './App.vue'

const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedState)

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
