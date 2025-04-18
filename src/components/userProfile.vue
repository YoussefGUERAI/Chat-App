<template>
    <div class="user-profile">
        <div v-if="loading" class="loading">
            <p>Loading...</p>
        </div>
        <div v-else-if="error" class="error">
            <p>Error: {{ error }}</p>
        </div>
        <div v-else-if="userData" class="user-info">
            <img
                :src="userData.pfp || require('@/assets/pfp_default.jpg')"
                alt="User Profile Picture"
                class="profile-pic"
            />
            <p class="username">{{ userData.username }}</p>
            <p class="bio">{{ userData.bio }}</p>
            <p class="email">{{ userData.email }}</p>
            <div v-if="currentUser">
                <!-- <div v-show="currentUser.uid === userData.uid" class="user-actions">
                    <router-link :to="{ name: 'EditProfile' }" class="edit-button">Edit Profile</router-link>

                </div> -->

                <div
                    v-show="currentUser.uid !== userData.uid"
                    class="online-status"
                >
                    <p class="status">
                        {{ userData.status ? "Online" : "Offline" }}
                    </p>
                    <p class="last">{{ formatDate(userData.lastOnline) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { auth } from "@/firebase/config";
import { defineProps, onMounted, computed } from "vue";
import { getUser } from "@/composables/getUser";

// Define props
const props = defineProps({
    userId: {
        type: String,
        required: true,
    },
});

// Destructure the returned refs from getUser
const { userData, error, loading } = getUser(props.userId);

// Log information for debugging
onMounted(() => {
    console.log("User ID from props:", props.userId);
});

// Computed property for the current authenticated user
const currentUser = computed(() => {
    return auth.currentUser || null;
});

// Format timestamp
const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    console.log(date);
    if (date.getSeconds() <= 10) {
        return "Just now";
    } else if (date.getSeconds() <= 60) {
        return date.getSeconds() + " seconds ago";
    } else if (date.getMinutes() <= 60) {
        return date.getMinutes() + " minutes ago";
    } else if (date.getHours() <= 24) {
        return date.getHours() + " hours ago";
    } else if (date.getDate() <= 1) {
        return "Less than 1 day ago";
    } else {
        return date.toLocaleDateString();
    }
};
</script>
<style scoped>
.user-profile {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    padding: 32px;
    background-color: #ffffff;
    color: #1f1f1f;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    font-family: "Inter", "Segoe UI", sans-serif;
    transition: all 0.3s ease-in-out;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding-top: 16px;
}

.profile-pic {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #e0e0e0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
}

.profile-pic:hover {
    transform: scale(1.05);
}

.username {
    font-size: 24px;
    font-weight: 600;
    color: #222;
    margin-top: 10px;
    position: relative;
    padding-bottom: 8px;
}

.username::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background-color: #55ef95;
    /* Accent green */
    border-radius: 2px;
}

.bio {
    font-size: 15px;
    text-align: center;
    color: #555;
    max-width: 90%;
    line-height: 1.6;
    margin-bottom: 12px;
}

.email {
    font-size: 14px;
    color: #444;
    background-color: #f1f3f5;
    padding: 6px 14px;
    border-radius: 20px;
    display: inline-block;
}

.online-status {
    margin-top: 20px;
    background-color: #f9fafb;
    border-left: 4px solid #55ef95;
    padding: 14px;
    width: 100%;
    text-align: center;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease;
}

.online-status:hover {
    transform: translateY(-2px);
}

.status {
    font-weight: 600;
    color: #28a745;
    margin-bottom: 4px;
}

.last {
    font-size: 13px;
    color: #888;
}

.loading,
.error {
    padding: 20px;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12px;
    color: #333;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.error {
    border-left: 4px solid #ff6b6b;
}

/* Responsive tweaks */
@media (max-width: 576px) {
    .user-profile {
        padding: 24px 16px;
        max-width: 90%;
    }

    .profile-pic {
        width: 100px;
        height: 100px;
    }

    .username {
        font-size: 20px;
    }

    .bio {
        font-size: 14px;
    }
}
</style>
