<template>
    <div class="container mt-5">
        <div class="back-btn-container">
            <button class="back-btn" @click="goToHome">
                <i class="fas fa-arrow-left"></i>
                <span>Back to Chat</span>
            </button>
        </div>

        <h2>Create Group Chat</h2>

        <GroupProfileEditor :group="groupData" @update:pfp="updateGroupPfp" class="mb-4" />

        <div class="form-group">
            <label>Group Name:</label>
            <input v-model="groupName" type="text" class="form-control" placeholder="Enter group name" />
        </div>

        <div class="form-group mt-3">
            <label>Bio (optional):</label>
            <input v-model="groupBio" type="text" class="form-control" placeholder="Group description" />
        </div>

        <div class="form-group mt-4">
            <label>Search users:</label>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by username..." />
        </div>

        <!-- Selected users as oval icons -->
        <div class="selected-users mt-3">
            <span v-for="userId in selectedUserIds" :key="userId" class="badge badge-pill badge-primary">
                {{ getUsernameById(userId) }}
                <button type="button" class="btn-close" @click="removeUser(userId)">
                    &times;
                </button>
            </span>
        </div>

        <!-- Matching users (only show when searchQuery is not empty) -->
        <div v-if="searchQuery.trim()" class="form-group mt-3">
            <div v-if="filteredUsers.length" class="txt">
                <label>Matching users:</label>
                <div v-for="user in filteredUsers" :key="user.uid" class="form-check">
                    <input type="checkbox" :id="user.uid" :value="user.uid" v-model="selectedUserIds"
                        class="form-check-input" />
                    <label :for="user.uid" class="form-check-label">
                        {{ user.username }}
                    </label>
                </div>
            </div>
            <div v-if="!filteredUsers.length" class="mt-3">
                <p class="txt">No matching users found.</p>
            </div>
        </div>


        <button class="create" @click="createGroupChat">
            Create Group
        </button>
    </div>
</template>
<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
}

.back-btn-container {
    width: 100%;
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

.mb-4 {
    margin-bottom: 1.5rem;
}

.selected-users {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.badge {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #284B63;

    color: #FFFFFF;

    border-radius: 20px;
}

.btn-close {
    background: none;
    border: none;
    color: #FFFFFF;
    font-size: 1rem;
    margin-left: 0.5rem;
    cursor: pointer;
}

h2 {
    color: #3C6E71;
}

label {
    color: #353535;
}

input.form-control {
    border: 1px solid #D9D9D9;
    color: #353535;
}

input.form-control::placeholder {
    color: #D9D9D9;
}

.txt {
    color: #353535;
    margin-bottom: 5%;
}

input.form-check-input:checked {
    background-color: #284B63;
    border-color: #284B63;
}

.create {
    background-color: #284B63;
    border-color: #284B63;
    color: #FFFFFF;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
}

.create:hover {
    background-color: #3C6E71;
    border-color: #3C6E71;
}
</style>


<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { db, auth, firebase } from "@/firebase/config";
import { getAllUsers } from "@/composables/getUser";
import GroupProfileEditor from "@/components/GroupProfileEditor.vue";

const groupName = ref("");
const groupBio = ref("");
const searchQuery = ref("");
const selectedUserIds = ref([]);
const groupPfp = ref("");
const users = ref([]);
const router = useRouter();
const currentUser = ref(auth.currentUser);

// Computed property to create a group data object for the GroupProfileEditor
const groupData = computed(() => {
    return {
        name: groupName.value,
        pfp:
            groupPfp.value ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                groupName.value || "Group"
            )}`,
    };
});

// Update the generated avatar when group name changes
watch(groupName, (newName) => {
    if (!groupPfp.value && newName) {
        groupData.value.pfp = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            newName
        )}`;
    }
});

onMounted(() => {
    // Wait for Firebase Auth to resolve
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser.value = user;
            const { users: fetchedUsers } = await getAllUsers();
            users.value = fetchedUsers.value;
        } else {
            console.error("User not authenticated");
            // Optional: redirect to login page or show error
        }
    });
});

onMounted(async () => {
    const { users: fetchedUsers } = await getAllUsers();
    users.value = fetchedUsers.value;
});

// Filter out current user + apply search
const filteredUsers = computed(() => {
    if (!currentUser.value) return [];
    return users.value
        .filter((u) => u.uid !== currentUser.value.uid)
        .filter((u) =>
            u.username.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
});

// Update group profile picture
const updateGroupPfp = (url) => {
    groupPfp.value = url;
};

// Get username by user ID
const getUsernameById = (userId) => {
    const user = users.value.find((u) => u.uid === userId);
    return user ? user.username : "Unknown";
};

// Back button navigation function
const goToHome = () => {
    router.push('/home');
};

// Remove user from selected list
const removeUser = (userId) => {
    selectedUserIds.value = selectedUserIds.value.filter((id) => id !== userId);
};

const createGroupChat = async () => {
    if (!groupName.value || selectedUserIds.value.length === 0) {
        alert("Please provide a group name and select at least one user.");
        return;
    }

    const members = [...selectedUserIds.value, currentUser.value.uid];

    const groupRef = await db.collection("group").add({
        name: groupName.value,
        admin: auth.currentUser.uid,
        bio: groupBio.value || "",
        users: members,
        type: "group",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
        pfp:
            groupPfp.value ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                groupName.value
            )}`,
    });

    await db
        .collection("group")
        .doc(groupRef.id)
        .collection("messages")
        .add({
            content: `Group "${groupName.value}" created by ${currentUser.value.displayName || "Admin"
                }.`,
            sender: currentUser.value.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

    alert("Group chat created successfully.");
    router.push("/home");
};
</script>
