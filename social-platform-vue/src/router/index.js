import { createRouter, createWebHashHistory } from "vue-router";
import FeedView from "../views/FeedView.vue";
import PublishView from "../views/PublishView.vue";
import ProfileView from "../views/ProfileView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";

const routes = [
  { path: "/", name: "feed", component: FeedView },
  { path: "/publish", name: "publish", component: PublishView, meta: { requiresAuth: true } },
  { path: "/profile", name: "profile", component: ProfileView, meta: { requiresAuth: true } },
  { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", name: "register", component: RegisterView, meta: { guestOnly: true } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("sharehub_token");

  if (to.meta.requiresAuth && !token) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && token) {
    next({ name: "feed" });
  } else {
    next();
  }
});

export default router;