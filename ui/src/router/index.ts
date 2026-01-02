import { createRouter,  createWebHistory, type RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ChatView from "../views/ChatView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "AI Assistant chat Home",
      description: "Create your personal AI assistant channel and start chatting instantly",
      robots: "index, follow"
    }
  },
  {
    path: "/chat",
    name: "AI chat",
    component: ChatView,
    meta: {
      title: "AI assistant chat - Private Channel",
      description: "Your private AI chat channel conversation",
      robots: "noindex, nofollow"
    }
  },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
      return { top: 0 };
    }
});

router.afterEach((to) => {
  document.title = (to.meta.title as string) ?? "AI Assistant Chat";
  const descriptionTag: HTMLMetaElement | null =
    document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (descriptionTag && to.meta.description) {
    descriptionTag.setAttribute("content", to.meta.description as string);
  }

  let robotsTag: HTMLMetaElement | null =
    document.querySelector<HTMLMetaElement>('meta[name="robots"]');

  if (!robotsTag) {
    robotsTag = document.createElement("meta");
    robotsTag.name = "robots";
    document.head.appendChild(robotsTag);
  }
  robotsTag.content = (to.meta.robots as string) ?? "index, follow";
});