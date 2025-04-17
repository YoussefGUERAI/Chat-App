<template>
    <div class="profile-container">
        <userProfile :userId="userIdFromRoute" />
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import userProfile from "@/components/userProfile.vue";

const route = useRoute();
const userIdFromRoute = route.params.uid;
</script>

<style scoped>
.profile-container {
    min-height: 100vh;
    width: 100%;
    background-color: #454d32;
    /* Darker olive green base */
    background-image: linear-gradient(135deg, #454d32 0%, #4d5d53 100%);
    /* Gradient from dark olive to sage */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 30px 20px;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .profile-container {
        padding: 20px 10px;
    }
}
</style>