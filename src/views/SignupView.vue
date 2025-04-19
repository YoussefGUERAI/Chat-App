<template>
    <div class="container">
        <h1 class="mb-4">Signup</h1>
        <div class="form-group center mt-3">
            <label for="email">Email</label>
            <input v-model="email" type="email" class="form-control" placeholder="Email" />
        </div>
        <div class="form-group center mt-4">
            <label for="password">Password</label>
            <input v-model="password" type="password" class="form-control" placeholder="Password" />
        </div>

        <div class="form-group center mt-4">
            <label for="password">Confirm Password</label>
            <input v-model="confirmPassword" type="password" class="form-control" placeholder="Confirm Password" />
        </div>

        <div class="form-group center mt-4">
            <label for="password">Username</label>
            <input v-model="username" type="text" class="form-control" placeholder="Username" />
        </div>

        <div class="form-group mt-3">
            <label>Bio (optional):</label>
            <input v-model="bio" type="text" class="form-control" placeholder="Tell us something about yourself" />
        </div>

        <div class="form-group mt-3">
            <label>Profile Picture (optional):</label>
            <div class="profile-pic-container">
                <img :src="profilePreview" alt="Profile" class="profile-preview" />
                <div class="profile-pic-controls">
                    <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" class="file-input" />
                    <button @click="triggerFileInput" class="btn btn-outline-secondary">
                        Choose Image
                    </button>
                    <button v-if="profileFile" @click="clearProfilePic" class="btn btn-outline-danger ml-2">
                        Clear
                    </button>
                </div>
                <div v-if="uploadingPic" class="mt-2">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ml-2">Uploading image...</span>
                </div>
            </div>
        </div>

        <button @click="signup" class="btn btn-primary mt-3">Signup</button>
        <div class="mt-3">Already have an account?</div>
        <router-link to="/">
            <button class="btn btn-secondary mt-3">Login</button>
        </router-link>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { db, auth } from "../firebase/config";
import { uploadToGitHub } from "@/composables/uploadToGitHub";

const email = ref("");
const password = ref("");
const username = ref("");
const bio = ref("");
const confirmPassword = ref("");
const router = useRouter();
const profileFile = ref(null);
const profileUrl = ref("");
const profilePreview = ref("/src/assets/pfp_default.jpg");
const fileInput = ref(null);
const uploadingPic = ref(false);

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file (max 2MB, only images)
    if (file.size > 2 * 1024 * 1024) {
        alert("File size should not exceed 2MB");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
    }

    profileFile.value = file;

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
        profilePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const clearProfilePic = () => {
    profileFile.value = null;
    profilePreview.value = "/src/assets/pfp_default.jpg";
    profileUrl.value = "";
    if (fileInput.value) {
        fileInput.value.value = "";
    }
};

const uploadProfilePic = async () => {
    if (!profileFile.value) return "";

    try {
        uploadingPic.value = true;
        const timestamp = new Date().getTime();
        const fileName = `signup_${timestamp}_${profileFile.value.name}`;
        const url = await uploadToGitHub(profileFile.value, fileName);
        return url;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Failed to upload profile picture, but signup will continue.");
        return "";
    } finally {
        uploadingPic.value = false;
    }
};

const signup = async () => {
    try {
        // 1. Check for UM6P domain
        if (!email.value.endsWith("@um6p.ma")) {
            alert("You must use a UM6P email address (e.g., name@um6p.ma).");
            return;
        }

        // 2. Check for matching passwords
        if (password.value !== confirmPassword.value) {
            alert("Passwords do not match.");
            return;
        }

        // 3. Upload profile picture if one was selected
        let pfpUrl = profilePreview.value;
        if (profileFile.value) {
            pfpUrl = await uploadProfilePic();
        }

        // 4. Create user in Firebase Auth
        const res = await auth.createUserWithEmailAndPassword(
            email.value,
            password.value
        );

        // 5. Save extra user data in Firestore with the profile picture URL
        await addUser(pfpUrl);

        // 6. Set display name
        await res.user.updateProfile({
            displayName: username.value,
        });

        console.log("Signup successful:", res);
        router.push("/home");
    } catch (err) {
        console.log("Signup error:", err.message);
        alert("Signup failed: " + err.message);
    }
};

// Add user to Firestore
const addUser = async (pfpUrl) => {
    const user = auth.currentUser;
    const uid = user.uid;

    const userData = {
        username: username.value,
        bio: bio.value,
        email: email.value,
        role: "user",
        status: true,
        pfp: pfpUrl || "/src/assets/pfp_default.jpg",
        lastOnline: new Date(),
    };

    await db.collection("users").doc(uid).set(userData);
    console.log("User added to database.");
};
</script>

<style scoped>
.profile-pic-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.profile-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
}

.profile-pic-controls {
    display: flex;
    gap: 0.5rem;
}

.file-input {
    display: none;
}

.ml-2 {
    margin-left: 0.5rem;
}

.mt-2 {
    margin-top: 0.5rem;
}
</style>
