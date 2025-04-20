<template>
    <div class="user-profile">
        <div v-if="loading" class="loading">
            <p>Loading...</p>
        </div>
        <div v-else-if="error" class="error">
            <p>Error: {{ error }}</p>
        </div>
        <div v-else-if="userData">
            <div v-if="currentUser" class="user-info">
                <div class="pfpp">
                    <img
                        :src="
                            userData.pfp || require('@/assets/pfp_default.jpg')
                        "
                        alt="User Profile Picture"
                        class="profile-pic"
                    />
                    <span v-if="currentUser.uid === userData.uid">
                        <i
                            class="bi bi-pencil"
                            style="cursor: pointer"
                            title="Edit Profile Picture"
                            @click="editPfp"
                        ></i>
                    </span>
                </div>

                <!-- Profile Picture Upload Modal -->
                <div v-if="showPfpModal" class="profile-pic-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4>Update Profile Picture</h4>
                            <span class="close-btn" @click="closePfpModal"
                                >&times;</span
                            >
                        </div>
                        <div class="modal-body">
                            <div class="profile-pic-preview">
                                <img
                                    :src="profilePreview || userData.pfp"
                                    alt="Preview"
                                    class="pic-preview"
                                />
                            </div>
                            <div class="upload-controls">
                                <input
                                    type="file"
                                    ref="fileInput"
                                    accept="image/*"
                                    @change="handleFileChange"
                                    class="file-input"
                                />
                                <button
                                    @click="triggerFileInput"
                                    class="upload-btn"
                                >
                                    <i class="bi bi-upload"></i> Select Image
                                </button>
                                <button
                                    v-if="profileFile"
                                    @click="clearProfilePic"
                                    class="clear-btn"
                                >
                                    <i class="bi bi-x-circle"></i> Clear
                                </button>
                            </div>
                            <div v-if="isUploading" class="upload-progress">
                                <div class="loading-spinner"></div>
                                <span>Uploading...</span>
                            </div>
                            <div v-if="uploadError" class="upload-error">
                                {{ uploadError }}
                            </div>
                            <div class="modal-actions">
                                <button
                                    @click="uploadProfilePic"
                                    class="save-btn"
                                    :disabled="!profileFile || isUploading"
                                >
                                    Save Changes
                                </button>
                                <button
                                    @click="closePfpModal"
                                    class="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End Modal -->

                <div class="detail">
                    <form
                        v-if="isEditingUsername"
                        @submit.prevent="saveProfileEdits"
                    >
                        <input
                            ref="usernameInputRef"
                            v-model="editedUsername"
                            class="username"
                            @blur="isEditingUsername = false"
                        />
                        <button type="submit" style="display: none"></button>
                        <!-- Hidden submit button to enable form submission on Enter -->
                    </form>

                    <div v-else>
                        <p class="username">
                            {{ editedUsername }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i
                                    class="bi bi-pencil"
                                    style="cursor: pointer"
                                    title="Edit Username"
                                    @click="startEditingUsername"
                                ></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div class="detail">
                    <form
                        v-if="isEditingBio"
                        @submit.prevent="saveProfileEdits"
                    >
                        <input
                            ref="bioInputRef"
                            v-model="editedBio"
                            class="bio"
                            @blur="isEditingBio = false"
                        />
                        <button type="submit" style="display: none"></button>
                    </form>
                    <div v-else>
                        <p class="bio">
                            {{ editedBio }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i
                                    class="bi bi-pencil"
                                    style="cursor: pointer"
                                    title="Edit Bio"
                                    @click="startEditingBio"
                                ></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div class="detail">
                    <form
                        v-if="isEditingEmail"
                        @submit.prevent="saveProfileEdits"
                    >
                        <input
                            ref="emailInputRef"
                            v-model="editedEmail"
                            class="email"
                            @blur="isEditingEmail = false"
                        />
                        <button type="submit" style="display: none"></button>
                    </form>
                    <div v-else>
                        <p class="email">
                            {{ editedEmail }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i
                                    class="bi bi-pencil"
                                    style="cursor: pointer"
                                    title="Edit Email"
                                    @click="startEditingEmail"
                                ></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div
                    v-show="currentUser.uid !== userData.uid"
                    class="online-status"
                >
                    <p class="status">
                        {{ userData.status ? "Online" : "Offline" }}
                    </p>
                    <p class="last">{{ formatDate(userData.lastOnline) }}</p>
                </div>

                <!-- Password Change Option - Only visible for current user -->
                <div
                    v-if="currentUser.uid === userData.uid"
                    class="password-change-section"
                >
                    <button
                        class="change-password-btn"
                        @click="isChangingPassword = true"
                        v-if="!isChangingPassword"
                    >
                        <i class="bi bi-key"></i> Change Password
                    </button>
                    <div v-if="isChangingPassword" class="password-form">
                        <form @submit.prevent="changePassword">
                            <div class="password-input-group">
                                <div class="password-field">
                                    <input
                                        :type="
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        "
                                        v-model="currentPassword"
                                        placeholder="Current Password"
                                        class="password-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="toggle-password"
                                        @click="
                                            showCurrentPassword =
                                                !showCurrentPassword
                                        "
                                    >
                                        <i
                                            class="bi"
                                            :class="
                                                showCurrentPassword
                                                    ? 'bi-eye-slash'
                                                    : 'bi-eye'
                                            "
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            <div class="password-input-group">
                                <div class="password-field">
                                    <input
                                        :type="
                                            showNewPassword
                                                ? 'text'
                                                : 'password'
                                        "
                                        v-model="newPassword"
                                        placeholder="New Password"
                                        class="password-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="toggle-password"
                                        @click="
                                            showNewPassword = !showNewPassword
                                        "
                                    >
                                        <i
                                            class="bi"
                                            :class="
                                                showNewPassword
                                                    ? 'bi-eye-slash'
                                                    : 'bi-eye'
                                            "
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            <div class="password-input-group">
                                <div class="password-field">
                                    <input
                                        :type="
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        "
                                        v-model="confirmPassword"
                                        placeholder="Confirm New Password"
                                        class="password-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        class="toggle-password"
                                        @click="
                                            showConfirmPassword =
                                                !showConfirmPassword
                                        "
                                    >
                                        <i
                                            class="bi"
                                            :class="
                                                showConfirmPassword
                                                    ? 'bi-eye-slash'
                                                    : 'bi-eye'
                                            "
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            <div class="password-actions">
                                <button type="submit" class="submit-btn">
                                    Update Password
                                </button>
                                <button
                                    type="button"
                                    class="cancel-btn"
                                    @click="cancelPasswordChange"
                                >
                                    Cancel
                                </button>
                            </div>
                            <p v-if="passwordError" class="password-error">
                                {{ passwordError }}
                            </p>
                            <p v-if="passwordSuccess" class="password-success">
                                {{ passwordSuccess }}
                            </p>
                        </form>
                    </div>
                </div>

                <!-- Delete Account Section - Only visible for current user -->
                <div
                    v-if="currentUser.uid === userData.uid"
                    class="delete-account-section"
                >
                    <button
                        class="delete-account-btn"
                        @click="showDeleteConfirm = true"
                        v-if="!showDeleteConfirm"
                    >
                        <i class="bi bi-trash"></i> Delete Account
                    </button>
                    <div v-if="showDeleteConfirm" class="delete-account-form">
                        <p class="delete-warning">
                            Are you sure you want to delete your account? This
                            action cannot be undone.
                        </p>
                        <div class="password-input-group">
                            <div class="password-field">
                                <input
                                    :type="
                                        showDeletePassword ? 'text' : 'password'
                                    "
                                    v-model="deletePassword"
                                    placeholder="Enter your password to confirm"
                                    class="password-input"
                                    required
                                />
                                <button
                                    type="button"
                                    class="toggle-password"
                                    @click="
                                        showDeletePassword = !showDeletePassword
                                    "
                                >
                                    <i
                                        class="bi"
                                        :class="
                                            showDeletePassword
                                                ? 'bi-eye-slash'
                                                : 'bi-eye'
                                        "
                                    ></i>
                                </button>
                            </div>
                        </div>
                        <div class="delete-actions">
                            <button
                                type="button"
                                class="delete-confirm-btn"
                                @click="deleteAccount"
                            >
                                Confirm Delete
                            </button>
                            <button
                                type="button"
                                class="cancel-btn"
                                @click="cancelDelete"
                            >
                                Cancel
                            </button>
                        </div>
                        <p v-if="deleteError" class="delete-error">
                            {{ deleteError }}
                        </p>
                    </div>
                </div>
            </div>
            <div
                v-if="commonGroups && commonGroups.length > 0"
                class="common-groups"
            >
                <h3>Common Groups</h3>
                <ul>
                    <li
                        v-for="group in commonGroups"
                        :key="group.id"
                        class="group-item"
                    >
                        <router-link
                            :to="`/group-profile/${group.id}`"
                            class="group-link"
                        >
                            <img
                                :src="group.pfp"
                                alt="Group Profile Picture"
                                class="group-pic"
                            />
                            {{ group.name }}
                        </router-link>
                    </li>
                </ul>
            </div>
            <div
                v-else-if="
                    !loading && currentUser && currentUser.uid !== userData.uid
                "
                class="no-common-groups"
            >
                <p>No common groups with this user</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { auth, firebase } from "@/firebase/config";
import { ref, defineProps, onMounted, computed, watch, nextTick } from "vue";
import { getUser } from "@/composables/getUser";
import { db } from "@/firebase/config";
import { uploadToGitHub } from "@/composables/uploadToGitHub";

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
    console.log("Common groups in mounted:", commonGroups.value);
    fetchCommonGroups();
    console.log("Exit fetchCommunGroups in mounted:", commonGroups.value);
});

// Computed property for the current authenticated user
const currentUser = computed(() => {
    return auth.currentUser || null;
});

// Initialize commonGroups as a ref
const commonGroups = ref([]);

// Fetch common groups from Firestore directly
async function fetchCommonGroups() {
    // Log the state before starting
    console.log("Attempting to fetch common groups...");
    console.log(
        "Current User UID:",
        currentUser.value ? currentUser.value.uid : "No current user"
    );
    console.log("Profile User ID:", props.userId);

    if (!currentUser.value) {
        console.log("Fetch aborted: No current user logged in.");
        commonGroups.value = [];
        return;
    }

    if (props.userId === currentUser.value.uid) {
        console.log(
            "Fetch aborted: Viewing own profile, no common groups applicable."
        );
        commonGroups.value = [];
        return;
    }

    try {
        console.log(
            `Querying groups containing current user: ${currentUser.value.uid}`
        );
        // Step 1: Fetch groups where current user is a member
        const groupsSnapshot = await db
            .collection("group") // Changed from 'groups' to 'group'
            .where("users", "array-contains", currentUser.value.uid)
            .get(); // Execute the query to get the QuerySnapshot

        console.log(
            `Found ${groupsSnapshot.docs.length} groups containing the current user.`
        );

        if (groupsSnapshot.empty) {
            console.log("No groups found where the current user is a member.");
            commonGroups.value = [];
            return; // Exit early if no groups found for the current user
        }

        // Log the raw data fetched for the current user's groups
        const currentUserGroups = groupsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log(
            "Groups containing current user:",
            JSON.stringify(currentUserGroups, null, 2)
        );

        // Step 2: Filter groups that also include props.userId
        console.log(`Filtering these groups for profile user: ${props.userId}`);
        const commonGroupsList = currentUserGroups
            // Ensure group.users exists and is an array before trying to access includes
            .filter((group) => {
                const includesProfileUser =
                    group.users &&
                    Array.isArray(group.users) &&
                    group.users.includes(props.userId);
                // Log filtering decision for each group
                console.log(
                    `Group ${group.id}: Users=${JSON.stringify(
                        group.users
                    )}, Includes ${props.userId}? ${includesProfileUser}`
                );
                return includesProfileUser;
            });

        console.log(
            `Found ${commonGroupsList.length} common groups after filtering.`
        );
        commonGroups.value = commonGroupsList;
        console.log(
            "Common groups successfully fetched and updated:",
            JSON.stringify(commonGroups.value, null, 2)
        ); // Log final result
    } catch (err) {
        console.error("Error fetching common groups:", err);
        commonGroups.value = []; // Reset on error
    }
}

// Watch for changes in the current user or userId and refetch common groups
watch([currentUser, () => props.userId], () => {
    fetchCommonGroups();
});
console.log("Common groups:", commonGroups.value);

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
const isEditingUsername = ref(false);
const isEditingBio = ref(false);
const isEditingEmail = ref(false);

const editedUsername = ref("");
const editedBio = ref("");
const editedEmail = ref("");

watch(userData, (newVal) => {
    if (newVal) {
        editedUsername.value = newVal.username;
        editedBio.value = newVal.bio;
        editedEmail.value = newVal.email;
    }
});

// Template refs for inputs
const usernameInputRef = ref(null);
const bioInputRef = ref(null);
const emailInputRef = ref(null);

// Functions to start editing and focus input
const startEditingUsername = () => {
    isEditingUsername.value = true;
    nextTick(() => {
        usernameInputRef.value?.focus();
    });
};

const startEditingBio = () => {
    isEditingBio.value = true;
    nextTick(() => {
        bioInputRef.value?.focus();
    });
};

const startEditingEmail = () => {
    isEditingEmail.value = true;
    nextTick(() => {
        emailInputRef.value?.focus();
    });
};

const saveProfileEdits = async () => {
    console.log("saveProfileEdits function called"); // Add this line for debugging
    // Ensure currentUser has a value before proceeding
    if (!currentUser.value) {
        console.error("Cannot save profile: No user logged in.");
        // Optionally, provide user feedback here
        return;
    }
    try {
        // Update username and bio in Firestore
        const userDocRef = db.collection("users").doc(currentUser.value.uid);

        // Check if email has changed
        if (editedEmail.value !== userData.value.email) {
            // Update email in Firebase Authentication
            await auth.currentUser.updateEmail(editedEmail.value);
            console.log("Email updated in Firebase Auth successfully");
        }

        // Update all fields in Firestore
        await userDocRef.update({
            username: editedUsername.value,
            bio: editedBio.value,
            email: editedEmail.value,
        });

        // Exit editing mode
        isEditingUsername.value = false;
        isEditingBio.value = false;
        isEditingEmail.value = false;

        // Optional: show success message or update local state if needed
        console.log("Profile updated successfully");
        // Consider re-fetching userData or updating it directly if necessary for immediate UI update
        // Example: userData.value = { ...userData.value, username: editedUsername.value, bio: editedBio.value, email: editedEmail.value };
    } catch (error) {
        console.error("Error updating profile:", error);
        // Show specific error message for email update failures
        if (error.code === "auth/requires-recent-login") {
            alert(
                "For security reasons, please re-login before changing your email address."
            );
        } else if (error.code === "auth/email-already-in-use") {
            alert("This email address is already in use by another account.");
        } else {
            alert("Error updating profile: " + error.message);
        }
    }
};

const isChangingPassword = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const passwordSuccess = ref("");

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const changePassword = async () => {
    passwordError.value = "";
    passwordSuccess.value = "";

    if (newPassword.value !== confirmPassword.value) {
        passwordError.value = "New passwords do not match.";
        return;
    }

    try {
        const user = auth.currentUser;
        // Create credential with EmailAuthProvider
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword.value
        );

        // First reauthenticate
        await user.reauthenticateWithCredential(credential);

        // Then update password
        await user.updatePassword(newPassword.value);

        passwordSuccess.value = "Password updated successfully.";
        // Reset form and close it
        isChangingPassword.value = false;
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
    } catch (error) {
        console.error("Password change error:", error);
        // Handle specific error codes to provide better feedback
        if (error.code === "auth/wrong-password") {
            passwordError.value = "Current password is incorrect.";
        } else if (error.code === "auth/weak-password") {
            passwordError.value =
                "New password is too weak. Use at least 6 characters.";
        } else {
            passwordError.value = error.message;
        }
    }
};

const cancelPasswordChange = () => {
    isChangingPassword.value = false;
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    passwordError.value = "";
    passwordSuccess.value = "";
};

// Profile picture editing functionality
const showPfpModal = ref(false);
const fileInput = ref(null);
const profileFile = ref(null);
const profilePreview = ref("");
const isUploading = ref(false);
const uploadError = ref("");

// Open the profile picture modal
const editPfp = () => {
    showPfpModal.value = true;
};

// Close the profile picture modal and reset state
const closePfpModal = () => {
    showPfpModal.value = false;
    profileFile.value = null;
    profilePreview.value = "";
    uploadError.value = "";
};

// Trigger file input click
const triggerFileInput = () => {
    fileInput.value.click();
};

// Handle file selection
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file (max 2MB, only images)
    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = "File size should not exceed 2MB";
        return;
    }

    if (!file.type.startsWith("image/")) {
        uploadError.value = "Only image files are allowed";
        return;
    }

    profileFile.value = file;
    uploadError.value = "";

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
        profilePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Clear selected profile picture
const clearProfilePic = () => {
    profileFile.value = null;
    profilePreview.value = "";
    if (fileInput.value) {
        fileInput.value.value = "";
    }
};

// Upload profile picture to GitHub and update user profile
const uploadProfilePic = async () => {
    if (!profileFile.value || !currentUser.value) return;

    try {
        isUploading.value = true;
        uploadError.value = "";

        // Generate a unique filename with timestamp and user ID
        const timestamp = new Date().getTime();
        const userId = currentUser.value.uid;
        const fileName = `${userId}_${timestamp}_${profileFile.value.name}`;

        // Upload to GitHub
        const imageUrl = await uploadToGitHub(profileFile.value, fileName);

        // Update user profile in Firestore
        await db.collection("users").doc(userId).update({
            pfp: imageUrl,
        });

        // Update local state
        if (userData.value) {
            userData.value.pfp = imageUrl;
        }

        // Close modal and reset state
        closePfpModal();

        console.log("Profile picture updated successfully");
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        uploadError.value =
            "Failed to upload profile picture. Please try again.";
    } finally {
        isUploading.value = false;
    }
};

// Delete account functionality
const showDeleteConfirm = ref(false);
const deletePassword = ref("");
const showDeletePassword = ref(false);
const deleteError = ref("");

const deleteAccount = async () => {
    deleteError.value = "";

    if (!deletePassword.value) {
        deleteError.value = "Password is required to confirm account deletion.";
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            deleteError.value = "You must be logged in to delete your account.";
            return;
        }

        // Create credential with EmailAuthProvider for reauthentication
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            deletePassword.value
        );

        // Reauthenticate before sensitive operations
        await user.reauthenticateWithCredential(credential);

        // Get the user ID for cleanup operations
        const userId = user.uid;

        // 1. Clean up user's private chats
        const privateChatQuery = await db
            .collection("chat")
            .where("users", "array-contains", userId)
            .get();

        const privateDeletePromises = privateChatQuery.docs.map(async (doc) => {
            // Delete all messages in the chat
            const messagesQuery = await doc.ref.collection("messages").get();
            const messageDeletions = messagesQuery.docs.map((msgDoc) =>
                msgDoc.ref.delete()
            );
            await Promise.all(messageDeletions);

            // Delete the chat itself
            return doc.ref.delete();
        });
        await Promise.all(privateDeletePromises);

        // 2. Handle user's group membership
        const groupQuery = await db
            .collection("group")
            .where("users", "array-contains", userId)
            .get();

        const groupUpdatePromises = groupQuery.docs.map(async (doc) => {
            const groupData = doc.data();

            // If user is the admin and the only member, delete the group
            if (groupData.admin === userId && groupData.users.length === 1) {
                // Delete all messages in the group
                const messagesQuery = await doc.ref
                    .collection("messages")
                    .get();
                const messageDeletions = messagesQuery.docs.map((msgDoc) =>
                    msgDoc.ref.delete()
                );
                await Promise.all(messageDeletions);

                // Delete the group itself
                return doc.ref.delete();
            }
            // Otherwise, remove user from the group members
            else {
                // Update group data to remove user
                const updatedUsers = groupData.users.filter(
                    (uid) => uid !== userId
                );

                // If user was the admin, assign a new admin if there are other members
                let updatedAdmin = groupData.admin;
                if (groupData.admin === userId && updatedUsers.length > 0) {
                    updatedAdmin = updatedUsers[0]; // Assign first remaining user as admin
                }

                // Add a system message about the user leaving
                await doc.ref.collection("messages").add({
                    content: `User has left the group (account deleted).`,
                    sender_id: "system",
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                });

                // Update the group document
                return doc.ref.update({
                    users: updatedUsers,
                    admin: updatedAdmin,
                    lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
        });
        await Promise.all(groupUpdatePromises);

        // 3. Delete user document from Firestore
        await db.collection("users").doc(userId).delete();

        // 4. Finally, delete the user authentication account
        await user.delete();

        // Notify user of successful deletion
        alert("Your account has been permanently deleted.");

        // Redirect to login page
        window.location.href = "/";
    } catch (error) {
        console.error("Account deletion error:", error);

        // Handle specific error codes
        if (error.code === "auth/wrong-password") {
            deleteError.value = "Password is incorrect.";
        } else if (error.code === "auth/requires-recent-login") {
            deleteError.value =
                "For security reasons, please log out and log back in before deleting your account.";
        } else {
            deleteError.value = `Error: ${error.message}`;
        }
    }
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
    deletePassword.value = "";
    deleteError.value = "";
};
</script>

<style scoped>
.user-profile {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    padding: 32px;
    background-color: #ffffff;
    color: #353535;
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
    border: 4px solid #d9d9d9;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
}

.profile-pic:hover {
    transform: scale(1.05);
}

.pfpp {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.pfpp span {
    position: relative;
    top: 50px;
}

.detail {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
}

.username {
    font-size: 24px;
    font-weight: 600;
    color: #284b63;
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
    background-color: #3c6e71;
    border-radius: 2px;
}

.bio {
    font-size: 15px;
    text-align: center;
    color: #353535;
    max-width: 90%;
    line-height: 1.6;
    margin-bottom: 12px;
}

.email {
    font-size: 14px;
    color: #353535;
    background-color: #d9d9d9;
    padding: 6px 14px;
    border-radius: 20px;
    display: inline-block;
}

.online-status {
    margin-top: 20px;
    background-color: #d9d9d9;
    border-left: 4px solid #3c6e71;
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
    color: #3c6e71;
    margin-bottom: 4px;
}

.last {
    font-size: 13px;
    color: #353535;
}

.loading,
.error {
    padding: 20px;
    text-align: center;
    background-color: #d9d9d9;
    border-radius: 12px;
    color: #353535;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.error {
    border-left: 4px solid #284b63;
}

.detail form input.username,
.detail form input.bio {
    border: 0.5px #ffffff;
    border-style: hidden;
    background-color: inherit;
    padding: 0;
    margin: 0;
    box-shadow: none;
    width: auto;
    display: inline-block;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    font-family: inherit;
    line-height: inherit;
    text-align: inherit;
    border-radius: 50px;
}

.detail form input.username:focus,
.detail form input.bio:focus {
    outline: 1px solid #3c6e71;
    background-color: inherit;
}

.common-groups {
    margin-top: 20px;
    padding: 16px;
    background-color: #d9d9d9;
    border-top: 2px solid #284b63;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

.common-groups h3 {
    font-size: 20px;
    font-weight: 600;
    color: #284b63;
    margin-bottom: 12px;
}

.group-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    background-color: #ffffff;
    margin-bottom: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
}

.group-item:hover {
    transform: translateY(-2px);
}

.group-pic {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
    border: 2px solid #d9d9d9;
}

.group-link {
    text-decoration: none;
    color: #353535;
    display: flex;
    align-items: center;
    width: 100%;
}

.group-link:hover {
    color: #284b63;
}

.no-common-groups {
    margin-top: 20px;
    padding: 16px;
    background-color: #d9d9d9;
    border-radius: 12px;
    text-align: center;
    color: #353535;
    font-style: italic;
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

.password-change-section {
    margin-top: 20px;
    width: 100%;
    text-align: center;
}

.change-password-btn {
    background-color: #3c6e71;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.change-password-btn:hover {
    background-color: #284b63;
}

.password-form {
    margin-top: 20px;
}

.password-input-group {
    margin-bottom: 10px;
}

.password-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid #d9d9d9;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.password-actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.submit-btn,
.cancel-btn {
    background-color: #3c6e71;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover,
.cancel-btn:hover {
    background-color: #284b63;
}

.password-error {
    color: red;
    margin-top: 10px;
}

.password-success {
    color: green;
    margin-top: 10px;
}

.password-field {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.toggle-password {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: #3c6e71;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-pic-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.close-btn {
    cursor: pointer;
    font-size: 24px;
    color: #353535;
}

.profile-pic-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.pic-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #d9d9d9;
}

.upload-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.file-input {
    display: none;
}

.upload-btn,
.clear-btn {
    background-color: #3c6e71;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.upload-btn:hover,
.clear-btn:hover {
    background-color: #284b63;
}

.upload-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3c6e71;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.upload-error {
    color: red;
    margin-bottom: 20px;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.save-btn,
.cancel-btn {
    background-color: #3c6e71;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.save-btn:hover,
.cancel-btn:hover {
    background-color: #284b63;
}

.delete-account-section {
    margin-top: 20px;
    width: 100%;
    text-align: center;
}

.delete-account-btn {
    background-color: #d9534f;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.delete-account-btn:hover {
    background-color: #c9302c;
}

.delete-account-form {
    margin-top: 20px;
}

.delete-warning {
    color: #d9534f;
    font-weight: bold;
    margin-bottom: 10px;
}

.delete-actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.delete-confirm-btn {
    background-color: #d9534f;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.delete-confirm-btn:hover {
    background-color: #c9302c;
}

.delete-error {
    color: red;
    margin-top: 10px;
}
</style>
