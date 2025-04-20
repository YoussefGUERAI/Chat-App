<template>
    <div class="group-profile-editor">
        <div class="profile-pic-container">
            <img :src="groupPfp" alt="Group Picture" class="profile-pic" />
            <div class="profile-pic-overlay" @click="triggerFileInput">
                <i class="bi bi-camera"></i>
                <span>Change Group Photo</span>
            </div>
        </div>

        <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" class="file-input" />

        <div v-if="isUploading" class="upload-progress">
            <div class="loading-spinner"></div>
            <span>Uploading...</span>
        </div>

        <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import { uploadToGitHub } from "@/composables/uploadToGitHub";
import { db } from "@/firebase/config";

const props = defineProps({
    group: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["update:pfp"]);

const fileInput = ref(null);
const isUploading = ref(false);
const errorMessage = ref("");

// Compute group profile picture with fallback
const groupPfp = computed(() => {
    return (
        props.group.pfp ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            props.group.name || "Group"
        )}`
    );
});

// Trigger file input click
const triggerFileInput = () => {
    fileInput.value.click();
};

// Handle file selection
const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file (max 2MB, only images)
    if (file.size > 2 * 1024 * 1024) {
        errorMessage.value = "File size should not exceed 2MB";
        return;
    }

    if (!file.type.startsWith("image/")) {
        errorMessage.value = "Only image files are allowed";
        return;
    }

    try {
        isUploading.value = true;
        errorMessage.value = "";

        // Generate a unique filename with timestamp and group ID
        const timestamp = new Date().getTime();
        const groupId = props.group.uid;
        const fileName = `group_${groupId}_${timestamp}_${file.name}`;

        // Upload to GitHub
        const imageUrl = await uploadToGitHub(file, fileName);

        // Update group profile in Firestore if group already exists
        if (groupId) {
            await db.collection("groups").doc(groupId).update({
                pfp: imageUrl,
            });
        }

        // Emit the updated URL
        emit("update:pfp", imageUrl);
    } catch (error) {
        console.error("Error uploading group picture:", error);
        errorMessage.value =
            "Failed to upload group picture. Please try again.";
    } finally {
        isUploading.value = false;
    }
};
</script>

<style scoped>
.group-profile-editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.profile-pic-container {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
}

.profile-pic {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-pic-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.profile-pic-container:hover .profile-pic-overlay {
    opacity: 1;
}

.file-input {
    display: none;
}

.upload-progress,
.error-message {
    margin-top: 1rem;
    text-align: center;
}

.error-message {
    color: #e53935;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3498db;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
