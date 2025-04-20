import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import HomeView from "../views/HomeView.vue";
import ProfileView from "../views/ProfileView.vue";
import CreatePrivateChatView from "../views/CreatePrivateChatView.vue";
import CreateGroupChatView from "../views/CreateGroupChatView.vue";
import GroupView from "../views/GroupView.vue";
import { auth,db } from "@/firebase/config";
import ModeratorVue from "@/views/ModeratorVue.vue";
import NewReportView from "@/views/NewReportView.vue";

const routes = [
    {
        path: "/",
        name: "login",
        component: LoginView,
        meta: { requiresAuth: false, guestOnly: true },
    },
    {
        path: "/home",
        name: "home",
        component: HomeView,
        meta: { requiresAuth: true },
    },
    {
        path: "/signup",
        name: "signup",
        component: SignupView,
        meta: { requiresAuth: false, guestOnly: true },
    },
    {
        path: "/profile/:uid",
        name: "profile",
        component: ProfileView,
        props: true,
        meta: { requiresAuth: true },
    },
    {
        path: "/create-private",
        name: "create-private",
        component: CreatePrivateChatView,
        meta: { requiresAuth: true },
    },
    {
        path: "/create-group",
        name: "create-group",
        component: CreateGroupChatView,
        meta: { requiresAuth: true },
    },
    {
        path: "/group-profile/:groupId",
        name: "group",
        component: GroupView,
        props: true,
    },
    {
        path: "/dashboard",
        component: ModeratorVue,
    },
    {
        path:"/newReport",
        component: NewReportView
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const guestOnly = to.matched.some((record) => record.meta.guestOnly);
  
    // Wait for Firebase auth to be ready
    const waitForAuthReady = () =>
      new Promise((resolve) => {
        if (auth.currentUser !== null) return resolve(auth.currentUser);
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
  
    const user = await waitForAuthReady();
  
    // Block if user is banned
    if (user) {
      const userDoc = await db.collection("users").doc(user.uid).get();
      const userData = userDoc.data();
  
      if (userData?.role === "banned" && to.path !== "/banned") {
        return next({ path: "/login" });
      }
    }
  
    // Redirect to login if route requires auth but no user
    if (requiresAuth && !user) {
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }
  
    // Redirect to home if guest-only route and user is logged in
    if (guestOnly && user) {
      return next({ name: "home" });
    }
  
    // All checks passed, proceed
    return next();
});

export default router;
