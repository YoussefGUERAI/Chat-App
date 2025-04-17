<template>
    <div class="profile-view">
        <div class="container">
            <div class="back-button" @click="goBack">
                <i class="bi bi-arrow-left"></i> Back
            </div>

            <div class="profile-content">
                <h1>Your Profile</h1>

                <div v-if="loading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>

                <div v-else-if="error" class="error-container">
                    <p>{{ error }}</p>
                    <button @click="fetchUserData" class="retry-btn">
                        Try Again
                    </button>
                </div>

                <div v-else class="profile-details">
                    <UserProfileEditor
                        :user="userData"
                        @update:pfp="handleProfileUpdate"
                    />

                    <div class="form-group">
                        <label for="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            v-model="userData.username"
                            class="form-control"
                        />
                    </div>

                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea
                            id="bio"
                            v-model="userData.bio"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <p class="email-display">{{ userData.email }}</p>
                    </div>

                    <div class="form-actions">
                        <button
                            @click="updateProfile"
                            class="save-btn"
                            :disabled="saving"
                        >
                            <span v-if="saving">
                                <div class="loading-spinner small"></div>
                                Saving...
                            </span>
                            <span v-else>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db, auth } from "@/firebase/config";
import UserProfileEditor from "@/components/UserProfileEditor.vue";

const router = useRouter();
const userData = ref({});
const loading = ref(true);
const error = ref("");
const saving = ref(false);

// Fetch user data on component mount
onMounted(() => {
    fetchUserData();
});

// Go back to previous page
const goBack = () => {
    router.back();
};

// Fetch current user data
const fetchUserData = async () => {
    loading.value = true;
    error.value = "";

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            router.push("/login");
            return;
        }

        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) {
            userData.value = { ...userDoc.data(), uid: currentUser.uid };
        } else {
            error.value = "User profile not found.";
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        error.value = "Failed to load profile data. Please try again.";
    } finally {
        loading.value = false;
    }
};

// Handle profile picture update
const handleProfileUpdate = (newPfpUrl) => {
    userData.value.pfp = newPfpUrl;
};

// Update user profile
const updateProfile = async () => {
    saving.value = true;

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            router.push("/login");
            return;
        }

        // Update Firestore document
        await db.collection("users").doc(currentUser.uid).update({
            username: userData.value.username,
            bio: userData.value.bio,
            // Note: pfp is updated separately in the UserProfileEditor component
        });

        // Update display name in Auth
        await currentUser.updateProfile({
            displayName: userData.value.username,
        });

        // Navigate back to home after successful update
        router.push("/home");
    } catch (err) {
        console.error("Error updating profile:", err);
        error.value = "Failed to update profile. Please try again.";
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
.profile-view {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.container {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    cursor: pointer;
    font-weight: 500;
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

.email-display {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;
    font-size: 16px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.save-btn {
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 24px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.save-btn:disabled {
    background: #a0c4f1;
    cursor: not-allowed;
}

.retry-btn {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
}

.loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

.loading-spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive styles */
@media screen and (max-width: 768px) {
    .profile-view {
        padding: 16px;
    }

    .container {
        padding: 16px;
    }
}
</style>
