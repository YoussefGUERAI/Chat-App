<template>
    <div class="container mt-5">
        <h2>Create Group Chat</h2>

        <div class="form-group">
            <label>Group Name:</label>
            <input
                v-model="groupName"
                type="text"
                class="form-control"
                placeholder="Enter group name"
            />
        </div>

        <div class="form-group mt-3">
            <label>Bio (optional):</label>
            <input
                v-model="groupBio"
                type="text"
                class="form-control"
                placeholder="Group description"
            />
        </div>

        <div class="form-group mt-4">
            <label>Search users:</label>
            <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Search by username..."
            />
        </div>

        <div class="form-group mt-3">
            <label>Matching users:</label>
            <div
                v-for="user in filteredUsers"
                :key="user.uid"
                class="form-check"
            >
                <input
                    type="checkbox"
                    :id="user.uid"
                    :value="user.uid"
                    v-model="selectedUserIds"
                    class="form-check-input"
                />
                <label :for="user.uid" class="form-check-label">
                    {{ user.username }}
                </label>
            </div>
        </div>

        <button class="btn btn-primary mt-4" @click="createGroupChat">
            Create Group
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { db, auth, firebase } from "@/firebase/config";
import { getAllUsers } from "@/composables/getUser";

const groupName = ref("");
const groupBio = ref("");
const searchQuery = ref("");
const selectedUserIds = ref([]);

const users = ref([]);
const router = useRouter();
const currentUser = ref(auth.currentUser);

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

const createGroupChat = async () => {
    if (!groupName.value || selectedUserIds.value.length === 0) {
        alert("Please provide a group name and select at least one user.");
        return;
    }

    const members = [...selectedUserIds.value, currentUser.value.uid];

    const groupRef = await db.collection("group").add({
        name: groupName.value,
        bio: groupBio.value || "",
        users: members,
        type: "group",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
        pfp:
            "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(groupName.value),
    });

    await db
        .collection("group")
        .doc(groupRef.id)
        .collection("messages")
        .add({
            content: `Group "${groupName.value}" created by ${
                currentUser.value.displayName || "Admin"
            }.`,
            sender: currentUser.value.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

    alert("Group chat created successfully.");
    router.push("/home");
};
</script>
