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
                    <img :src="userData.pfp" alt="User Profile Picture" class="profile-pic" />
                    <span v-if="currentUser.uid === userData.uid">
                        <i class="bi bi-pencil" style="cursor: pointer;" title="Edit Username"></i>
                    </span>
                </div>
                <div class="detail">
                    <form v-if="isEditingUsername" @submit.prevent="saveProfileEdits">
                        <input ref="usernameInputRef" v-model="editedUsername" class="username" @blur="isEditingUsername = false" />
                        <button type="submit" style="display: none;"></button>
                        <!-- Hidden submit button to enable form submission on Enter -->
                    </form>

                    <div v-else>
                        <p class="username">
                            {{ editedUsername }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i class="bi bi-pencil" style="cursor: pointer;" title="Edit Username"
                                    @click="startEditingUsername"></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div class="detail">
                    <form v-if="isEditingBio" @submit.prevent="saveProfileEdits">
                        <input ref="bioInputRef" v-model="editedBio" class="bio" @blur="isEditingBio = false" />
                        <button type="submit" style="display: none;"></button>
                    </form>
                    <div v-else>
                        <p class="bio">
                            {{ editedBio }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i class="bi bi-pencil" style="cursor: pointer;" title="Edit Bio"
                                    @click="startEditingBio"></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div class="detail">
                    <form v-if="isEditingEmail" @submit.prevent="saveProfileEdits">
                        <input ref="emailInputRef" v-model="editedEmail" class="email" @blur="isEditingEmail = false" />
                        <button type="submit" style="display: none;"></button>
                    </form>
                    <div v-else>
                        <p class="email">
                            {{ editedEmail }}
                            <span v-if="currentUser.uid === userData.uid">
                                <i class="bi bi-pencil" style="cursor: pointer;" title="Edit Email"
                                    @click="startEditingEmail"></i>
                            </span>
                        </p>
                    </div>
                </div>

                <div v-show="currentUser.uid !== userData.uid" class="online-status">
                    <p class="status">
                        {{ userData.status ? "Online" : "Offline" }}
                    </p>
                    <p class="last">{{ formatDate(userData.lastOnline) }}</p>
                </div>
            </div>
            <div v-if="commonGroups && commonGroups.length > 0" class="common-groups">
                <h3>Common Groups</h3>
                <ul>
                    <li v-for="group in commonGroups" :key="group.id" class="group-item">
                        <img :src="group.pfp" alt="Group Profile Picture" class="group-pic" />
                        {{ group.name }}
                    </li>
                </ul>
            </div>
            <div v-else-if="!loading && currentUser && currentUser.uid !== userData.uid" class="no-common-groups">
                <p>No common groups with this user</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { auth } from '@/firebase/config';
import { ref, defineProps, onMounted, computed, watch, nextTick } from 'vue';
import { getUser } from '@/composables/getUser';
import { db } from '@/firebase/config';

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
    console.log("Current User UID:", currentUser.value ? currentUser.value.uid : 'No current user');
    console.log("Profile User ID:", props.userId);

    if (!currentUser.value) {
        console.log("Fetch aborted: No current user logged in.");
        commonGroups.value = [];
        return;
    }

    if (props.userId === currentUser.value.uid) {
        console.log("Fetch aborted: Viewing own profile, no common groups applicable.");
        commonGroups.value = [];
        return;
    }

    try {
        console.log(`Querying groups containing current user: ${currentUser.value.uid}`);
        // Step 1: Fetch groups where current user is a member
        const groupsSnapshot = await db
            .collection('group') // Changed from 'groups' to 'group'
            .where("users", "array-contains", currentUser.value.uid)
            .get(); // Execute the query to get the QuerySnapshot

        console.log(`Found ${groupsSnapshot.docs.length} groups containing the current user.`);

        if (groupsSnapshot.empty) {
            console.log("No groups found where the current user is a member.");
            commonGroups.value = [];
            return; // Exit early if no groups found for the current user
        }

        // Log the raw data fetched for the current user's groups
        const currentUserGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Groups containing current user:", JSON.stringify(currentUserGroups, null, 2));


        // Step 2: Filter groups that also include props.userId
        console.log(`Filtering these groups for profile user: ${props.userId}`);
        const commonGroupsList = currentUserGroups
            // Ensure group.users exists and is an array before trying to access includes
            .filter(group => {
                const includesProfileUser = group.users && Array.isArray(group.users) && group.users.includes(props.userId);
                // Log filtering decision for each group
                console.log(`Group ${group.id}: Users=${JSON.stringify(group.users)}, Includes ${props.userId}? ${includesProfileUser}`);
                return includesProfileUser;
            });

        console.log(`Found ${commonGroupsList.length} common groups after filtering.`);
        commonGroups.value = commonGroupsList;
        console.log("Common groups successfully fetched and updated:", JSON.stringify(commonGroups.value, null, 2)); // Log final result

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

const editedUsername = ref('');
const editedBio = ref('');
const editedEmail = ref('');

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
        // Correctly reference the user document using doc() and currentUser.value.uid
        const userDocRef = db.collection("users").doc(currentUser.value.uid);
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
        // Optionally, provide user feedback about the error
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




.detail form input.username,
.detail form input.bio {
    border: 0.5px #ffffff ; 
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
    outline: 1px solid #ccc; 
    
    background-color: inherit;
}





.common-groups {
    margin-top: 20px;
    padding: 16px;
    background-color: #f9fafb;
    border-top: 2px solid #d3ffcd;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

.common-groups h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
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
    border: 2px solid #e0e0e0;
}

.no-common-groups {
    margin-top: 20px;
    padding: 16px;
    background-color: #f9fafb;
    border-radius: 12px;
    text-align: center;
    color: #888;
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

</style>
