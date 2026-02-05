import { createRouter,  createWebHistory, type RouteRecordRaw } from "vue-router";
import { useUserStore } from "../stores/user";
import { isRouteLoading } from "../composables/useRouteLoading";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
    meta: {
      title: "AI Assistant chat Home",
      description:
        "Create your personal AI assistant channel and start chatting instantly",
      robots: "index, follow",
    },
  },
  {
    path: "/chat",
    name: "AI chat",
    component: () => import("../views/ChatView.vue"),
    meta: {
      title: "AI assistant chat - Private Channel",
      description: "Your private AI chat channel conversation",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: {
      title: "404 – Page Not Found",
      robots: "noindex, nofollow"
    },
  },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
      return { top: 0 };
    }
});

router.onError((): void => {
  isRouteLoading.value = false;
});

router.beforeEach((to, from, next) => {
  isRouteLoading.value = true;
  const user = useUserStore();

  if(to.name === "AI chat" && !user.isAuthenticated) {
    next({ name: "home", replace: true });
    return;
  }

  next();
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

  requestAnimationFrame((): void => {
    isRouteLoading.value = false;
  });
});