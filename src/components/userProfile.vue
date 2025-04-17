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
                    <p class="username">
                        {{ userData.username }}
                        <span v-if="currentUser.uid === userData.uid">
                            <i class="bi bi-pencil" style="cursor: pointer;" title="Edit Username"></i>
                        </span>
                    </p>

                </div>
                <div class="detail">
                    <p class="bio"> {{ userData.bio }} </p>
                    <span v-if="currentUser.uid === userData.uid">
                        <i class="bi bi-pencil" style="cursor: pointer;" title="Edit bio"></i>
                    </span>
                </div>
                <div class="detail">
                    <p class="email"> {{ userData.email }}
                        <span v-if="currentUser.uid === userData.uid">
                            <i class="bi bi-pencil" style="cursor: pointer;" title="Edit email"></i>
                        </span>
                    </p>
                </div>
                <div v-show="currentUser.uid === userData.uid" class="user-actions">
                    <button class="edit-button"><router-link :to="{ name: 'edit-profile' }" class="edit-button">
                            Edit Profile
                        </router-link>
                    </button>



                </div>

                <div v-show="currentUser.uid !== userData.uid" class="online-status">
                    <p class="status"> {{ userData.status ? 'Online' : 'Offline' }} </p>
                    <p class="last"> {{ userData.lastOnline }} </p>
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
import { ref, defineProps, onMounted, computed, watch } from 'vue';
import { getUser } from '@/composables/getUser';
import { db } from '@/firebase/config';

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
    font-family: 'Inter', 'Segoe UI', sans-serif;
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
.pfpp{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    
}
.pfpp span {
    position: relative;
    top: 50px;
}
.detail{
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
    content: '';
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

.edit-button {
    background-color: #05b14d;
    /* Accent green */
    color: #ffffff;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.edit-button:hover {
    background-color: #2ecc71;
    /* Darker green */
    transform: translateY(-2px);
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
</style>
