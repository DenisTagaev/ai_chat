import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { GiNotebook, BiSendPlus, BiPersonBadgeFill, BiRobot, MdErroroutlineRound } from "oh-vue-icons/icons";
import { router } from './router'
import { registerSW } from "virtual:pwa-register";
import './style.css'
import App from './App.vue'

addIcons(GiNotebook, BiSendPlus, BiPersonBadgeFill, BiRobot, MdErroroutlineRound);
const app = createApp(App);

app.component("OhVueIcon", OhVueIcon);

const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedState)

app.use(pinia);
app.use(router);

await router.isReady();
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