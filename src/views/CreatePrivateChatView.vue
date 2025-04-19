<template>
    <div class="container mt-5">
        <h2>Create Private Chat</h2>

        <div class="form-group mt-4">
            <label>Search users:</label>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by username..." />
        </div>

        <!-- User selection list -->
        <div v-if="searchQuery.trim()" class="form-group mt-3">
            <div v-if="filteredUsers.length" class="txt">
                <label>Matching users:</label>
                <div v-for="user in filteredUsers" :key="user.uid" class="user-select-row"
                    :class="{ selected: selectedUserId === user.uid }" @click="selectUser(user.uid)">
                    <input type="radio" :id="user.uid" :value="user.uid" v-model="selectedUserId" v-if="user.uid !== currentUser.uid"
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

        <button class="create mt-3" @click="createChat">
            Start Chat
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { db, auth, firebase } from "@/firebase/config";
import { getAllUsers } from "@/composables/getUser";

const selectedUserId = ref("");
const users = ref([]);
const searchQuery = ref("");
const router = useRouter();
const currentUser = ref(auth.currentUser);

onMounted(async () => {
    const { users: fetchedUsers } = await getAllUsers();
    users.value = fetchedUsers.value;
});

const filteredUsers = computed(() => {
    if (!currentUser.value) return [];
    return users.value
        .filter((u) => u.uid !== currentUser.value.uid)
        .filter((u) =>
            u.username.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
});

// Add selectUser for radio button logic
function selectUser(uid) {
    if (selectedUserId.value === uid) {
        selectedUserId.value = "";
    } else {
        selectedUserId.value = uid;
    }
}

const createChat = async () => {
    if (!selectedUserId.value) return;

    const uid1 = currentUser.value.uid;
    const uid2 = selectedUserId.value;
    const participants = [uid1, uid2].sort();
    const chatKey = [uid1, uid2].sort().join("_");

    const existingChats = await db
        .collection("chat")
        .where("chatKey", "==", chatKey)
        .get();

    if (!existingChats.empty) {
        console.log("Chat already exists.");
        router.push("/home");
        return;
    }

    const chatRef = await db.collection("chat").add({
        users: participants,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
        type: "private",
        chatKey: chatKey,
    });

    await db.collection("chat").doc(chatRef.id).collection("messages").add({
        content: "Welcome to the chat!",
        sender: currentUser.value.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("New chat created with ID:", chatRef.id);
    alert("New chat created successfully.");
    router.push("/home");
};
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 0 auto;
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

txt {
    color: #353535;
    margin-bottom: 5%;
}

.user-select-row {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #FFFFFF;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    border: 1px solid #D9D9D9;
    cursor: pointer;
    transition: background 0.2s, border 0.2s;
}

.user-select-row.selected {
    background-color: #284B63;
    color: #FFFFFF;
    border: 1.5px solid #3C6E71;
}

.user-select-row.selected label {
    color: #FFFFFF;
}

.user-select-row input[type="radio"] {
    accent-color: #284B63;
    margin-right: 0.75rem;
}

.create {
    background-color: #284B63;
    border-color: #284B63;
    color: #FFFFFF;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    transition: background 0.2s, border 0.2s;
}

.create:hover {
    background-color: #3C6E71;
    border-color: #3C6E71;
}
</style>
