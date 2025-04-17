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
    background: linear-gradient(135deg, #f5f7fa, #e8ecf0);
    /* Clean light gradient */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 20px;
    box-sizing: border-box;
}

/* Responsive padding */
@media (max-width: 576px) {
    .profile-container {
        padding: 24px 12px;
    }
}
</style>

