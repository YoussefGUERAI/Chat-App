<template>
    <div class="mini-navbar shadow-md rounded-lg">
        <div class="nav-items">
            <div class="nav-item profile" @click="goToProfile">
                <div class="nav-profile-pic-wrapper shadow-sm">
                    <img
                        :src="currentUserData?.pfp || defaultProfilePic"
                        alt="profile"
                        class="nav-profile-pic"
                    />
                </div>
                <span>Profile</span>
            </div>
            <div class="nav-item" @click="openNewChat">
                <div class="nav-icon-wrapper">
                    <i class="fas fa-comment-dots"></i>
                </div>
                <span>New Chat</span>
            </div>
            <div class="nav-item" @click="createNewGroup">
                <div class="nav-icon-wrapper">
                    <i class="fas fa-users"></i>
                </div>
                <span>New Group</span>
            </div>
            <div v-if="isMod" class="nav-item" @click="dashboard()">
                <div class="nav-icon-wrapper">
                    <i class="fas fa-home"></i>
                </div>
                <span>{{ dashboardText }}</span>
            </div>
            <div class="nav-item logout" @click="handleLogout">
                <div class="nav-icon-wrapper logout">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <span>Logout</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { logout } from "@/composables/userLogout";
import { db } from "@/firebase/config";
import { defineProps } from "vue";

// Props
const props = defineProps({
    currentUser: {
        type: Object,
        required: true,
    },
});

// User data state
const currentUserData = ref(null);
const defaultProfilePic = require("@/assets/pfp_default.jpg");

const router = useRouter();
const route = useRoute();
const isMod = ref(false);

// Navigation functions
const openNewChat = () => {
    router.push("/create-private");
};

const createNewGroup = () => {
    router.push("/create-group");
};

const goToProfile = () => {
    router.push("/profile/" + props.currentUser.uid);
};

const dashboard = () => {
    if (route.path === "/dashboard") {
        router.push("/home");
    } else {
        router.push("dashboard");
    }
};

const handleLogout = async () => {
    await logout(router);
};

const dashboardText = computed(() => {
    if (route.path === "/dashboard") {
        return "Home";
    } else {
        return "Dashboard";
    }
});

onMounted(async () => {
    // Log the current user prop for debugging
    console.log("MiniNavbar received currentUser:", props.currentUser);

    // Fetch user data from Firestore properly
    try {
        const userDoc = await db
            .collection("users")
            .doc(props.currentUser.uid)
            .get();
        if (userDoc.exists) {
            currentUserData.value = userDoc.data();
            console.log("Fetched user data:", currentUserData.value);
            isMod.value = currentUserData.value?.role === "moderator";
        } else {
            console.error("User document does not exist");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});
</script>

<style scoped>
.mini-navbar {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    background-color: #d9d9d9;
    /* Light background color */
    padding: var(--spacing-md);
    height: calc(100vh - 40px);
    box-sizing: border-box;
    overflow: hidden;
}

.nav-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: center;
    width: 100%;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: var(--radius-lg);
    width: max-content;
    text-align: center;
    transition: all 0.2s ease;
}

.nav-item:hover {
    background-color: #3c6e71;
    /* Hover background color */
    transform: translateY(-2px);
}

.nav-profile-pic-wrapper {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    margin-bottom: var(--spacing-xs);
    border: 2px solid white;
    background-color: #d9d9d9;
    /* Light background color */
}

.nav-profile-pic {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.nav-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: var(--radius-full);
    background-color: #d9d9d9;
    /* Light background color */
    margin-bottom: var(--spacing-xs);
    transition: all 0.2s ease;
}

.nav-item:hover .nav-icon-wrapper {
    background-color: #284b63;
    /* Primary color */
    color: #ffffff;
    /* White text color */
}

.nav-item span {
    font-size: 12px;
    font-weight: 500;
    margin-top: var(--spacing-xs);
    color: #353535;
    /* Dark text color */
}

.nav-item i {
    font-size: 1.2rem;
    color: #3c6e71;
    /* Secondary color */
    transition: color 0.2s ease;
}

.nav-item:hover i {
    color: #ffffff;
    /* White text color */
}

.nav-item.logout {
    margin-top: auto;
}

.nav-icon-wrapper.logout {
    background-color: var(--gray-100);
}

.nav-item.logout:hover .nav-icon-wrapper {
    background-color: #284b63;
    /* Primary color */
}

.nav-item.logout i {
    color: #284b63;
    /* Primary color */
}

.nav-item.logout:hover i {
    color: #ffffff;
    /* White text color */
}

/* Mobile Layout */
@media screen and (max-width: 768px) {
    .mini-navbar {
        width: 60px;
        min-width: 60px;
        max-width: 60px;
        padding: var(--spacing-sm);
        background-color: white;
        border-radius: var(--radius-lg);
    }

    .nav-items {
        gap: var(--spacing-md);
    }

    .nav-item {
        padding: var(--spacing-xs);
    }

    .nav-profile-pic-wrapper {
        width: 38px;
        height: 38px;
    }

    .nav-icon-wrapper {
        width: 36px;
        height: 36px;
    }

    .nav-item i {
        font-size: 1rem;
    }

    .nav-item span {
        font-size: 10px;
    }
}

@media screen and (max-width: 480px) {
    .mini-navbar {
        width: 50px;
        min-width: 50px;
        max-width: 50px;
        padding: var(--spacing-xs);
    }

    .nav-profile-pic-wrapper {
        width: 32px;
        height: 32px;
    }

    .nav-icon-wrapper {
        width: 32px;
        height: 32px;
    }

    .nav-item i {
        font-size: 0.9rem;
    }
}
</style>
