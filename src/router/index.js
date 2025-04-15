import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import HomeView from "../views/HomeView.vue";
import ProfileView from "../views/ProfileView.vue";
import CreatePrivateChatView from "../views/CreatePrivateChatView.vue";
import CreateGroupChatView from "../views/CreateGroupChatView.vue";

const routes = [
    {
        path: "/",
        name: "login",
        component: LoginView,
    },
    {
        path: "/home",
        name: "home",
        component: HomeView,
    },
    {
        path: "/signup",
        name: "signup",
        component: SignupView,
    },
    {
        path: "/profile/:uid",
        name: "profile",
        component: ProfileView,
        props: true,
    },
    {
        path: "/create-private",
        name: "create-private",
        component: CreatePrivateChatView,
    },
    {
        path: "/create-group",
        name: "create-group",
        component: CreateGroupChatView,
    }
    
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
