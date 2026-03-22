import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "welcome",
      component: () => import("@/modules/welcome/views/Welcome.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/modules/auth/views/Login.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/modules/disk/views/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("auth_token");
  if (to.meta.requiresAuth && !token) {
    next({ name: "welcome" });
  } else if (to.name === "login" && token) {
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;
