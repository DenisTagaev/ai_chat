import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { router } from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App);

const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedState)

app.use(pinia);
app.use(router);
app.mount('#app');