<template>
    <div class="container" v-if="!isLoading">
        <!-- Left mini navbar -->
        <div class="item mini-navbar">
            <div class="nav-items">
                <div class="nav-item" @click="goToProfile">
                    <img
                        :src="currentUser.pfp"
                        alt="profile"
                        class="nav-profile-pic"
                    />
                    <span>Profile</span>
                </div>
                <div class="nav-item" @click="openNewChat">
                    <i class="bi bi-chat-dots"></i>
                    <span>New Chat</span>
                </div>
                <div class="nav-item" @click="createNewGroup">
                    <i class="bi bi-people"></i>
                    <span>New Group</span>
                </div>
                <div class="nav-item logout" @click="handleLogout">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </div>
            </div>
        </div>

        <!-- Desktop Layout -->
        <template v-if="!isMobile">
            <!-- Middle section - Conversation list -->
            <div class="item conversation-list">
                <div class="search-container">
                    <input
                        type="text"
                        v-model="searchQuery"
                        @input="handleSearch"
                        placeholder="Search users and groups..."
                        class="search-input"
                    />
                </div>
                <div class="conversations">
                    <!-- Individual chats -->
                    <div
                        v-for="chat in conversations"
                        :key="chat.uid"
                        class="conversation-item"
                        @click="selectConversation(chat)"
                    >
                        <img
                            :src="getOtherUserPfp(chat).pfp"
                            alt="profile"
                            class="conversation-pic"
                        />
                        <div class="conversation-info">
                            <h4>{{ getOtherUsername(chat) }}</h4>
                            <p>{{ chat.lastMessage?.content || "" }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right section - Current chat -->
            <div class="item current-chat">
                <div class="chat-header" v-if="activeChat.uid">
                    <img :src="activeChat.pfp" alt="chat" class="chat-pic" />
                    <div class="chat-info">
                        <h3>
                            {{
                                activeChat.name || getOtherUsername(activeChat)
                            }}
                        </h3>
                        <p>{{ activeChat.bio || "" }}</p>
                    </div>
                </div>
                <div class="chat-messages" v-if="activeChat.uid">
                    <div
                        v-for="message in messages"
                        :key="message.uid"
                        :class="[
                            'message-wrapper',
                            message.sender === currentUser.uid
                                ? 'sent'
                                : 'received',
                        ]"
                    >
                        <div class="message-content">
                            <div
                                v-if="
                                    activeChat.type === 'group' &&
                                    message.sender !== currentUser.uid
                                "
                                class="message-sender"
                            >
                                {{ getUsernameById(message.sender) }}
                            </div>
                            <p>{{ message.content }}</p>
                            <span class="timestamp">{{
                                formatTimestamp(message.createdAt)
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="chat-placeholder" v-else>
                    <h3>Select a conversation to start chatting</h3>
                </div>
                <div class="chat-input" v-if="activeChat.uid">
                    <input
                        v-model="newMessage"
                        @keyup.enter="sendMessage"
                        placeholder="Type a message..."
                        class="message-input"
                    />
                    <button @click="sendMessage" class="send-btn">
                        <i class="bi bi-send"></i>
                        <span>Send</span>
                    </button>
                </div>
            </div>
        </template>

        <!-- Mobile Layout -->
        <template v-else>
            <div class="item main-content">
                <!-- Chat list view -->
                <div v-if="!activeChat.uid" class="chat-list-view">
                    <div class="search-container">
                        <input
                            type="text"
                            v-model="searchQuery"
                            @input="handleSearch"
                            placeholder="Search users and groups..."
                            class="search-input"
                        />
                    </div>
                    <div class="conversations">
                        <!-- Individual chats -->
                        <div
                            v-for="chat in conversations"
                            :key="chat.uid"
                            class="conversation-item"
                            @click="selectConversation(chat)"
                        >
                            <img
                                :src="getOtherUserPfp(chat).pfp"
                                alt="profile"
                                class="conversation-pic"
                            />
                            <div class="conversation-info">
                                <h4>{{ getOtherUsername(chat) }}</h4>
                                <p>{{ chat.lastMessage?.content || "" }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Current chat view -->
                <div v-else class="current-chat-view">
                    <div class="chat-header">
                        <button class="back-button" @click="activeChat = {}">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <img
                            :src="activeChat.pfp"
                            alt="chat"
                            class="chat-pic"
                        />
                        <div class="chat-info">
                            <h3>
                                {{
                                    activeChat.name ||
                                    getOtherUsername(activeChat)
                                }}
                            </h3>
                            <p>{{ activeChat.bio || "" }}</p>
                        </div>
                    </div>
                    <div class="chat-messages">
                        <div
                            v-for="message in messages"
                            :key="message.uid"
                            :class="[
                                'message-wrapper',
                                message.sender === currentUser.uid
                                    ? 'sent'
                                    : 'received',
                            ]"
                        >
                            <div class="message-content">
                                <div
                                    v-if="
                                        activeChat.type === 'group' &&
                                        message.sender !== currentUser.uid
                                    "
                                    class="message-sender"
                                >
                                    {{ getUsernameById(message.sender) }}
                                </div>
                                <p>{{ message.content }}</p>
                                <span class="timestamp">{{
                                    formatTimestamp(message.createdAt)
                                }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input
                            v-model="newMessage"
                            @keyup.enter="sendMessage"
                            placeholder="Type a message..."
                            class="message-input"
                        />
                        <button @click="sendMessage" class="send-btn">
                            <i class="bi bi-send"></i>
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <div v-else>
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading chat...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getConversations } from "@/composables/getConversations";
import { getCurrentUser, getAllUsers } from "@/composables/getUser";
import { getMessages } from "@/composables/getMessages";
import { logout } from "@/composables/userLogout";
import { addMessageToChat } from "@/composables/addMessageToChat";

// Router setup
const router = useRouter();

// UI state using refs (Composition API)
const searchQuery = ref("");
const activeChat = ref({});
const newMessage = ref("");
const isMobile = ref(window.innerWidth <= 768);
const isLoading = ref(true);

// Data states using refs (Composition API)
const currentUser = ref(null);
const users = ref([]);
const conversations = ref([]);
const messages = ref([]);

// Format timestamp for messages (following the schema's timestamp format)
const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Handle window resize with composition API pattern
const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
};

// Handle search functionality
const handleSearch = () => {
    if (!searchQuery.value.trim()) return;

    // Filter conversations based on search query
    const query = searchQuery.value.toLowerCase();

    // Search in chats (private) and groups based on schema structure
    const filteredConversations = conversations.value.filter((conv) => {
        if (conv.type === "group") {
            // For groups, search by name (per schema)
            return conv.name.toLowerCase().includes(query);
        } else {
            // For private chats, search by other user's name
            const otherUserId = conv.users.find(
                (id) => id !== currentUser.value?.uid
            );
            const otherUser = users.value.find((u) => u.uid === otherUserId);
            return otherUser?.username.toLowerCase().includes(query);
        }
    });

    // Update conversations with filtered results
    conversations.value = filteredConversations;
};

// Get the username of a user by ID
const getUsernameById = (userId) => {
    if (!userId) return "Unknown User";
    const user = users.value.find((u) => u.uid === userId);
    return user ? user.username : "Unknown User";
};

// Get the other user's details in a private chat
const getOtherUserInfo = (chat) => {
    if (!chat || !chat.users) return { username: "", pfp: "" };

    if (chat.type === "group") {
        // For groups, use name and pfp fields per schema
        return {
            username: chat.name || "Group Chat",
            pfp: chat.pfp || "",
        };
    }

    // For private chats, find the other user in the users array
    // Using the schema's structure where users is an array of UIDs
    const otherUserId = chat.users.find((id) => id !== currentUser.value?.uid);
    if (!otherUserId) return { username: "", pfp: "" };

    return {
        username: users.value.find((u) => u.uid === otherUserId).username,
        pfp: users.value.find((u) => u.uid === otherUserId).pfp,
    };
};

// Helper functions for UI
const getOtherUsername = (chat) => {
    return getOtherUserInfo(chat).username;
};

// const getOtherUserPfp = (chat) => {
//     return getOtherUserInfo(chat).pfp;
// };

// Select a chat conversation - following schema structure
const selectConversation = async (chat) => {
    if (!chat) return;

    activeChat.value = chat;

    // Get messages using the composable
    // For private chats, use chatKey (uid1_uid2)
    // For groups, use the document ID
    const chatIdentifier = chat.type === "private" ? chat.chatKey : chat.uid;

    if (chatIdentifier) {
        try {
            const result = await getMessages(chatIdentifier);
            // Ensure we're getting the messages array from the result
            messages.value = Array.isArray(result)
                ? result
                : result.messages?.value || [];
        } catch (error) {
            console.error("Error fetching messages:", error);
            messages.value = [];
        }
    }
};

// Send a new message - following schema structure for messages
const sendMessage = async () => {
    if (!newMessage.value.trim() || !activeChat.value) return;

    try {
        // Use chatKey for private chats, uid for groups
        const chatIdentifier =
            activeChat.value.type === "private"
                ? activeChat.value.chatKey
                : activeChat.value.uid;

        if (!chatIdentifier) return;

        // Create message data following the schema structure
        const messageData = {
            content: newMessage.value,
            sender_id: currentUser.value.uid,
        };

        // Send message using the composable
        await addMessageToChat(chatIdentifier, messageData);
        newMessage.value = "";
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

// Navigation functions
const openNewChat = () => {
    router.push("/create-private");
};

const createNewGroup = () => {
    router.push("/create-group");
};

const goToProfile = () => {
    router.push("/profile");
};

const handleLogout = async () => {
    await logout(router);
};

// Fetch initial data using Composition API lifecycle hooks
onMounted(async () => {
    isLoading.value = true;

    try {
        // Get current user
        const userResult = await getCurrentUser();
        currentUser.value = userResult.userData?.value || null;

        // Get all users
        const usersResult = await getAllUsers();
        users.value = usersResult.users?.value || [];

        // Get conversations
        const conversationsResult = await getConversations();
        conversations.value = conversationsResult.conversations?.value || [];

        // Sort conversations by lastUpdate (newest first)
        conversations.value.sort((a, b) => {
            if (!a.lastUpdate) return 1;
            if (!b.lastUpdate) return -1;

            const dateA = a.lastUpdate.toDate
                ? a.lastUpdate.toDate()
                : new Date(a.lastUpdate);
            const dateB = b.lastUpdate.toDate
                ? b.lastUpdate.toDate()
                : new Date(b.lastUpdate);

            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error initializing data:", error);
    } finally {
        isLoading.value = false;
    }

    // Set up window resize listener
    window.addEventListener("resize", handleResize);
});

// Clean up event listeners when component unmounts
onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});

// Watch for active chat changes to update messages
watch(activeChat, async (newChat) => {
    if (newChat && newChat.uid) {
        await selectConversation(newChat);
    } else {
        messages.value = [];
    }
});
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    max-width: 100vw;
}

body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100vw;
    max-width: 100vw;
}

.container {
    display: flex;
    gap: 20px;
    flex-direction: row;
    height: 100vh;
    padding: 20px;
    background-color: #f5f5f5;
    box-sizing: border-box;
    margin: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    max-width: 100vw;
    overflow: hidden;
}

.item {
    background-color: white;
    border-radius: 8px;
    padding: 15px;
    height: calc(100vh - 40px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    overflow: hidden;
}

/* Mini navbar styles */
.mini-navbar {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
}

.nav-items {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    width: 100%;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
    text-align: center;
}

.nav-item:hover {
    background-color: #f5f5f5;
}

.nav-profile-pic {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-bottom: 5px;
}

.nav-item span {
    font-size: 12px;
    margin-top: 5px;
}

.nav-item.logout {
    margin-top: auto;
    color: #dc3545;
}

/* Conversation list styles */
.conversation-list {
    width: 25%;
    min-width: 250px;
    max-width: 350px;
    flex-shrink: 0;
}

.conversations {
    height: calc(100% - 60px);
    overflow-y: auto;
    margin-top: 15px;
}

.conversation-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 8px;
}

.conversation-item:hover {
    background-color: #f5f5f5;
}

.conversation-pic {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 12px;
}

.conversation-info h4 {
    margin: 0;
    font-size: 16px;
}

.conversation-info p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #666;
}

/* Current chat styles */
.current-chat {
    width: calc(75% - 100px);
    min-width: 300px;
    flex-grow: 1;
}

.chat-header {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.chat-pic {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
}

.chat-info h3 {
    margin: 0;
    font-size: 18px;
}

.chat-info p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #666;
}

.chat-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 70px);
    color: #666;
}

/* Keep existing message and input styles */
.message-content {
    max-width: 70%;
    padding: 10px;
    border-radius: 10px;
    position: relative;
    margin-bottom: 20px;
}

.message-content.sent {
    background-color: #dcf8c6;
    margin-left: auto;
    border-bottom-right-radius: 2px;
}

.message-content.received {
    background-color: #e9e9eb;
    margin-right: auto;
    border-bottom-left-radius: 4px;
}

.message-content.group-message {
    margin-left: 0;
}

.message-sender {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: bold;
}

.timestamp {
    font-size: 10px;
    color: #666;
    position: absolute;
    bottom: -16px;
    right: 0;
}

.chat-messages {
    padding: 20px;
    height: calc(100% - 140px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
}

.message-wrapper {
    display: flex;
    width: 100%;
    margin-bottom: 24px;
}

.message-wrapper.sent {
    justify-content: flex-end;
}

.message-wrapper.received {
    justify-content: flex-start;
}

.message-content {
    max-width: 60%;
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
}

.sent .message-content {
    background-color: #dcf8c6;
    border-bottom-right-radius: 4px;
}

.received .message-content {
    background-color: #e9e9eb;
    border-bottom-left-radius: 4px;
}

.message-sender {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: bold;
}

.timestamp {
    font-size: 10px;
    color: #666;
    position: absolute;
    bottom: -18px;
    right: 0;
}

/* Remove any conflicting message styles */
.message-content.sent,
.message-content.received,
.message-content.group-message {
    margin: 0;
}

/* Search container */
.search-container {
    width: 100%;
    max-width: 100%;
    position: relative;
    margin-bottom: 15px;
}

.search-input {
    width: 100%;
    padding: 12px 15px 12px 40px;
    border-radius: 25px;
    border: 1px solid #e0e0e0;
    background-color: #f8f9fa;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
    outline: none;
    border-color: #4caf50;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-container::before {
    content: "\f002";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 14px;
}

/* Chat input */
.chat-input {
    width: 100%;
    max-width: 100%;
    display: flex;
    gap: 10px;
    padding: 15px;
    background-color: #fff;
    border-top: 1px solid #e9ecef;
    position: sticky;
    bottom: 0;
    align-items: center;
}

.message-input {
    flex: 1;
    padding: 12px 15px;
    border-radius: 20px;
    border: 1px solid #e9ecef;
    background-color: #f8f9fa;
    font-size: 14px;
    transition: all 0.3s ease;
    resize: none;
    min-height: 20px;
    max-height: 100px;
    overflow-y: auto;
}

.message-input:focus {
    outline: none;
    border-color: #4caf50;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.send-btn {
    min-width: 80px;
    padding: 12px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.send-btn:hover {
    background-color: #45a049;
    transform: translateY(-1px);
}

.send-btn:active {
    transform: translateY(1px);
}

.send-btn i {
    font-size: 16px;
}

/* Main content area */
.main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* Back button */
.back-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    margin-right: 10px;
    color: #666;
}

.back-button:hover {
    color: #333;
}

/* Mobile Layout */
@media screen and (max-width: 768px) {
    .container {
        padding: 0;
        gap: 0;
    }

    .item {
        border-radius: 0;
        padding: 10px;
        height: 100vh;
    }

    .mini-navbar {
        width: 60px;
        min-width: 60px;
        max-width: 60px;
        padding: 10px 5px;
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
    }

    .nav-items {
        gap: 15px;
    }

    .nav-item {
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .nav-item:hover {
        background-color: #e9ecef;
    }

    .nav-profile-pic {
        width: 35px;
        height: 35px;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .nav-item i {
        font-size: 1.2rem;
        color: #495057;
    }

    .nav-item.logout i {
        color: #dc3545;
    }

    .main-content {
        width: calc(100% - 60px);
        height: 100%;
        padding: 0;
    }

    .chat-list-view,
    .current-chat-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .search-container {
        padding: 10px;
        background-color: #fff;
        border-bottom: 1px solid #e9ecef;
    }

    .search-input {
        padding: 12px 15px 12px 40px;
        border-radius: 25px;
        border: 1px solid #e0e0e0;
        background-color: #f8f9fa;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #4caf50;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .search-container::before {
        left: 25px;
    }

    .conversations {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
    }

    .conversation-item {
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 8px;
        transition: background-color 0.2s;
    }

    .conversation-item:hover {
        background-color: #f8f9fa;
    }

    .conversation-pic {
        width: 45px;
        height: 45px;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chat-header {
        padding: 15px;
        background-color: #fff;
        border-bottom: 1px solid #e9ecef;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .back-button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 8px;
        margin-right: 10px;
        color: #495057;
        transition: color 0.2s;
    }

    .back-button:hover {
        color: #212529;
    }

    .chat-pic {
        width: 40px;
        height: 40px;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
    }

    .message-content {
        max-width: 80%;
        padding: 12px;
        border-radius: 15px;
        margin-bottom: 8px;
    }

    .chat-input {
        padding: 10px;
    }

    .message-input {
        padding: 10px 15px;
        font-size: 14px;
    }

    .send-btn {
        padding: 10px 15px;
        font-size: 14px;
    }
}

@media screen and (max-width: 480px) {
    .mini-navbar {
        width: 50px;
        min-width: 50px;
        max-width: 50px;
        padding: 8px 3px;
    }

    .nav-profile-pic {
        width: 30px;
        height: 30px;
    }

    .nav-item i {
        font-size: 1.1rem;
    }

    .main-content {
        width: calc(100% - 50px);
    }

    .conversation-pic {
        width: 40px;
        height: 40px;
    }

    .chat-pic {
        width: 35px;
        height: 35px;
    }

    .message-content {
        max-width: 85%;
        padding: 10px;
    }

    .message-input {
        padding: 8px 12px;
        font-size: 13px;
    }

    .send-btn {
        padding: 8px 12px;
        font-size: 13px;
    }

    .search-input {
        padding: 10px 15px 10px 40px;
        font-size: 13px;
    }

    .search-container::before {
        left: 25px;
        font-size: 13px;
    }
}
</style>
