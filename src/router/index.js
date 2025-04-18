import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import HomeView from "../views/HomeView.vue";
import ProfileView from "../views/ProfileView.vue";
import CreatePrivateChatView from "../views/CreatePrivateChatView.vue";
import CreateGroupChatView from "../views/CreateGroupChatView.vue";
import { auth } from "@/firebase/config";
import ModeratorVue from "@/views/ModeratorVue.vue";

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
        path: "/dashboard",
        component: ModeratorVue
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const guestOnly = to.matched.some((record) => record.meta.guestOnly);

    // Create a promise to wait for Firebase auth state
    const waitForAuthReady = () => {
        return new Promise((resolve) => {
            // If auth is already initialized with a user
            if (auth.currentUser !== null) {
                return resolve(auth.currentUser);
            }

            // Otherwise wait for the auth state to initialize
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    };

    // Wait for auth to be ready before deciding on navigation
    waitForAuthReady().then((user) => {
        // Handle routes requiring auth
        if (requiresAuth && !user) {
            next({
                name: "login",
                query: { redirect: to.fullPath },
            });
        }
        // Handle guest-only routes
        else if (guestOnly && user) {
            next({ name: "home" });
        }
        // Proceed as normal
        else {
            next();
        }
    });
});

export default router;
