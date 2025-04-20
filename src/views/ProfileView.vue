<template>
    <div class="profile-container">
        <div class="back-btn-container">
            <button class="back-btn" @click="goToHome">
                <i class="fas fa-arrow-left"></i>
                <span>Back to Chat</span>
            </button>
        </div>
        <userProfile :userId="userIdFromRoute" />
    </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import userProfile from "@/components/userProfile.vue";

const route = useRoute();
const router = useRouter();
const userIdFromRoute = route.params.uid;

const goToHome = () => {
    router.push('/home');
};
</script>

<style scoped>
.profile-container {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #D9D9D9, #FFFFFF);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 40px 20px;
    box-sizing: border-box;
}

.back-btn-container {
    width: 100%;
    max-width: 800px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #284B63;
    color: #FFFFFF;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
    background-color: #3C6E71;
    transform: translateY(-1px);
}

.back-btn:active {
    transform: translateY(0);
}

.back-btn i {
    font-size: 1rem;
}

/* Responsive padding */
@media (max-width: 576px) {
    .profile-container {
        padding: 24px 12px;
    }
}
</style>
