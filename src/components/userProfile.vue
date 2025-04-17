<template>
    <div class="user-profile">
        <div v-if="loading" class="loading">
            <p>Loading...</p>
        </div>
        <div v-else-if="error" class="error">
            <p>Error: {{ error }}</p>
        </div>
        <div v-else-if="userData" class="user-info">
            <img :src="userData.pfp" alt="User Profile Picture" class="profile-pic" />
            <p class="username"> {{ userData.username }} </p>
            <p class="bio"> {{ userData.bio }} </p>
            <p class="email"> {{ userData.email }} </p>
            <div v-if="currentUser">
                <!-- <div v-show="currentUser.uid === userData.uid" class="user-actions">
                    <router-link :to="{ name: 'EditProfile' }" class="edit-button">Edit Profile</router-link>

                </div> -->

                <div v-show="currentUser.uid !== userData.uid" class="online-status">
                    <p class="status"> {{ userData.status ? 'Online' : 'Offline' }} </p>
                    <p class="last"> {{ userData.lastOnline }} </p>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { auth } from '@/firebase/config';
import { defineProps, onMounted, computed } from 'vue';
import { getUser } from '@/composables/getUser';

// Define props
const props = defineProps({
    userId: {
        type: String,
        required: true
    }
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
</script>
<style scoped>
.user-profile {
    max-width: 480px;
    height: auto;
    margin: 40px auto;
    padding: 30px;
    background-color: #c0c0c0;
    /* Medium sage green */
    color: #FFFFFF;
    /* White text for contrast */
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.user-info {
    padding: 25px;
    border-radius: 12px;
    background-color: #898a74;
    /* Lighter olive/sage */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-pic {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 24px;
    border: 4px solid #FFFFFF;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
}

.profile-pic:hover {
    transform: scale(1.05);
}

.username {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 15px;
    color: #FFFFFF;
    /* White for contrast */
    position: relative;
    padding-bottom: 10px;
}

.username::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(to right, #454d32, #FFFFFF, #454d32);
    border-radius: 3px;
}

.bio {
    font-size: 16px;
    color: #F0F0F0;
    /* Off-white for readability */
    margin-bottom: 18px;
    line-height: 1.6;
    text-align: center;
    font-weight: 500;
}

.email {
    font-size: 15px;
    color: #FFFFFF;
    /* White */
    margin-bottom: 24px;
    padding: 6px 12px;
    background-color: #5e644f;
    /* Olive accent */
    border-radius: 20px;
    display: inline-block;
}

.online-status {
    margin-top: 18px;
    padding: 15px;
    background-color: #4d5d53;
    /* Deep sage */
    border-radius: 12px;
    border-left: 4px solid #696969;
    /* Gray accent */
    width: 100%;
    text-align: center;
    transition: transform 0.2s ease;
}

.online-status:hover {
    transform: translateY(-3px);
}

.status {
    font-weight: bold;
    color: #8bff79;
    /* Light green for online */
    margin-bottom: 5px;
}

.last {
    font-size: 14px;
    color: #E0E0E0;
    /* Light gray */
}

.loading,
.error {
    padding: 25px;
    text-align: center;
    background-color: #5e644f;
    /* Olive */
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    color: #FFFFFF;
}

.error {
    border-left: 4px solid #D76574;
    /* Soft red */
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .user-profile {
        max-width: 90%;
        padding: 20px;
        margin: 20px auto;
    }

    .user-info {
        padding: 20px 15px;
    }

    .profile-pic {
        width: 120px;
        height: 120px;
    }

    .username {
        font-size: 24px;
    }
}
</style>
