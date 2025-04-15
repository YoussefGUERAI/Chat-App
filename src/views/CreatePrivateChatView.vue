<template>
    <div class="container mt-5">
      <h2>Create Private Chat</h2>
  
      <div class="form-group">
        <label>Select a user:</label>
        <select v-model="selectedUserId" class="form-control">
          <option disabled value="">-- Choose a user --</option>
          <option
            v-for="user in filteredUsers"
            :key="user.uid"
            :value="user.uid"
          >
            {{ user.username }}
          </option>
        </select>
      </div>
  
      <button class="btn btn-primary mt-3" @click="createChat">
        Start Chat
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue"
  import { useRouter } from "vue-router"
  import { db,auth, firebase } from "@/firebase/config"
  import { getAllUsers } from "@/composables/getUser";

  
  const selectedUserId = ref("")
  const users = ref([])
  const router = useRouter()
  const currentUser = ref(auth.currentUser)


  
  // ✅ 1. Fetch users
  onMounted(async () => {
  const { users: fetchedUsers } = await getAllUsers()
  users.value = fetchedUsers.value
})
  
  // ✅ 2. Filter out the current user
  const filteredUsers = computed(() =>
    users.value.filter(u => u.uid !== currentUser.value.uid)
  )
  
  // ✅ 3. Create chat if not already exists
  const createChat = async () => {
    if (!selectedUserId.value) return
  
    const uid1 = currentUser.value.uid
    const uid2 = selectedUserId.value
    const participants = [uid1, uid2].sort()
    const chatKey = [uid1, uid2].sort().join("_")
 // ensure order
  
    // Check if a chat already exists with same participants
    const existingChats = await db
      .collection("chat")
      .where("chatKey", "==", chatKey)
      .get()
  
    if (!existingChats.empty) {
      console.log("Chat already exists.")
      router.push("/home")
      return
    }
  
    // Add new chat
    const chatRef = await db.collection("chat").add({
  users: participants,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
  type: "private",
  chatKey: chatKey
})

    // ✅ FIX: use .doc(chatRef.id) to get the document reference
    await db.collection("chat").doc(chatRef.id).collection("messages").add({
    content: "Welcome to the chat!",
    sender: currentUser.value.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })

  
    console.log("New chat created with ID:", chatRef.id)
    alert("New chat created successfully.")
    router.push("/home")
  }
  </script>
  