<template>
    <div class="container" v-if="!isLoading">
        <!-- Left mini navbar -->
        <div class="item mini-navbar">
            <div class="nav-items">
                <div class="nav-item" @click="goToProfile">
                    <img
                        :src="
                            currentUser?.pfp ||
                            'https://ui-avatars.com/api/?name=User'
                        "
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
                            :src="getConversationPfp(chat)"
                            alt="profile"
                            class="conversation-pic"
                        />
                        <div class="conversation-info">
                            <h4>{{ getConversationName(chat) }}</h4>
                            <p>{{ chat.lastMessage?.content || "" }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right section - Current chat -->
            <div class="item current-chat">
                <div class="chat-header" v-if="hasActiveChat">
                    <img
                        :src="getActiveChatPfp()"
                        alt="chat"
                        class="chat-pic"
                    />
                    <div class="chat-info">
                        <h3>
                            {{ getActiveChatName() }}
                        </h3>
                        <p>{{ activeChat.bio || "" }}</p>
                    </div>
                </div>
                <div class="chat-messages" v-if="hasActiveChat">
                    <div v-if="messageLoading" class="message-loading">
                        <div class="loading-spinner"></div>
                        <p>Loading messages...</p>
                    </div>
                    <div v-else-if="hasMessages">
                        <div
                            v-for="message in messages"
                            :key="message.uid || message.id"
                            :class="[
                                'message-wrapper',
                                message.sender_id === currentUser?.uid
                                    ? 'sent'
                                    : 'received',
                            ]"
                        >
                            <div class="message-content">
                                <div
                                    v-if="
                                        activeChat.type === 'group' &&
                                        message.sender_id !== currentUser?.uid
                                    "
                                    class="message-sender"
                                >
                                    {{ getUserName(message.sender_id) }}
                                </div>
                                <p>{{ message.content }}</p>
                                <span class="timestamp">{{
                                    formatDate(
                                        message.created_at || message.createdAt
                                    )
                                }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                </div>
                <div v-else class="chat-placeholder">
                    <h3>Select a conversation to start chatting</h3>
                    <br />
                    <p>
                        Choose from your existing conversations or start a new
                        one
                    </p>
                </div>
                <div class="chat-input" v-if="hasActiveChat">
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
                <div v-if="!hasActiveChat" class="chat-list-view">
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
                                :src="getConversationPfp(chat)"
                                alt="profile"
                                class="conversation-pic"
                            />
                            <div class="conversation-info">
                                <h4>{{ getConversationName(chat) }}</h4>
                                <p>{{ chat.lastMessage?.content || "" }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Current chat view -->
                <div v-else class="current-chat-view">
                    <div class="chat-header">
                        <button
                            class="back-button"
                            @click="
                                activeChat = {};
                                chatIdentifier = null;
                                chatType = null;
                            "
                        >
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <img
                            :src="getActiveChatPfp()"
                            alt="chat"
                            class="chat-pic"
                        />
                        <div class="chat-info">
                            <h3>
                                {{ getActiveChatName() }}
                            </h3>
                            <p>{{ activeChat.bio || "" }}</p>
                        </div>
                    </div>
                    <div class="chat-messages">
                        <div v-if="messageLoading" class="message-loading">
                            <div class="loading-spinner"></div>
                            <p>Loading messages...</p>
                        </div>
                        <div v-else-if="hasMessages">
                            <div
                                v-for="message in messages"
                                :key="message.uid || message.id"
                                :class="[
                                    'message-wrapper',
                                    message.sender_id === currentUser?.uid
                                        ? 'sent'
                                        : 'received',
                                ]"
                            >
                                <div class="message-content">
                                    <div
                                        v-if="
                                            activeChat.type === 'group' &&
                                            message.sender_id !==
                                                currentUser?.uid
                                        "
                                        class="message-sender"
                                    >
                                        {{ getUserName(message.sender_id) }}
                                    </div>
                                    <p>{{ message.content }}</p>
                                    <span class="timestamp">{{
                                        formatDate(
                                            message.created_at ||
                                                message.createdAt
                                        )
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-messages">
                            <p>No messages yet. Start the conversation!</p>
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
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useAllChats } from "@/composables/getConversations";
import { getAllUsers } from "@/composables/getUser";
import { useMessages, addMessageToChat } from "@/composables/getMessages";
import { auth } from "@/firebase/config";
import { logout } from "@/composables/userLogout";
import { db } from "@/firebase/config";
import { cloneDeep } from "lodash";

// Router setup
const router = useRouter();

// UI state refs
const searchQuery = ref("");
const activeChat = ref({});
const newMessage = ref("");
const isMobile = ref(window.innerWidth <= 768);
const isLoading = ref(true);

// Data states refs
const users = ref([]);
const currentUser = ref(null);
const messages = ref([]);
const originalConversations = ref([]); // Store original conversations for search

// Message loading state
const messageLoading = ref(false);
const chatIdentifier = ref(null);
const chatType = ref(null);

// Get auth state
const { isAuthenticated, isLoading: authLoading } = useAuth();

// Fetch conversations
const { allChats: conversations } = useAllChats();

// Computed properties
const hasMessages = computed(() => messages.value && messages.value.length > 0);
const hasActiveChat = computed(
    () => !!activeChat.value.uid || !!activeChat.value.chatKey
);

// Set up message listener when chatIdentifier changes
watch(
    [chatIdentifier, chatType],
    ([newChatId, newChatType]) => {
        // Reset message state
        messageLoading.value = true;
        messages.value = []; // Clear existing messages

        // Don't proceed if missing required info
        if (!newChatId || !newChatType) {
            console.error("Missing required chat information:", {
                chatId: newChatId,
                chatType: newChatType,
            });
            messageLoading.value = false;
            messages.value = []; // Clear any existing messages
            return;
        }

        if (!["private", "group"].includes(newChatType)) {
            console.error(
                `Invalid chat type: ${newChatType}. Must be 'private' or 'group'`
            );
            messageLoading.value = false;
            messages.value = [];
            return;
        }

        console.log(`Loading messages for ${newChatType} chat: ${newChatId}`);

        try {
            // Create a new messages composable instance
            const {
                messages: chatMessages,
                loading,
                error,
            } = useMessages(newChatId, newChatType);

            // Monitor loading state
            watch(
                loading,
                (isLoading) => {
                    messageLoading.value = isLoading;
                    if (!isLoading && chatMessages.value.length === 0) {
                        console.log("No messages found for this chat");
                    }
                },
                { immediate: true }
            );

            // Monitor error state
            watch(
                error,
                (newError) => {
                    if (newError) {
                        console.error("Message loading error:", newError);
                        messageLoading.value = false;
                    }
                },
                { immediate: true }
            );

            // Watch the messages from the composable - use more efficient watching
            watch(
                chatMessages,
                (newMessages) => {
                    console.log(
                        `${newMessages.length} messages received for ${newChatType} chat`
                    );
                    // Use a more efficient approach to update messages
                    // Set directly instead of creating a new array to reduce reactivity overhead
                    messages.value = newMessages;

                    // Only auto-scroll when messages change and we're not loading
                    if (!messageLoading.value) {
                        setTimeout(() => {
                            const messagesContainer =
                                document.querySelector(".chat-messages");
                            if (messagesContainer) {
                                messagesContainer.scrollTop =
                                    messagesContainer.scrollHeight;
                            }
                        }, 50);
                    }
                },
                { immediate: true }
            );
        } catch (error) {
            console.error("Error setting up message listener:", error);
            messages.value = [];
            messageLoading.value = false;
        }
    },
    { immediate: true }
);

// Format timestamp for messages
const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Handle window resize
const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
};

// Handle search functionality
const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        // If search is cleared, restore original conversations
        if (originalConversations.value.length > 0) {
            conversations.value = cloneDeep(originalConversations.value);
        }
        return;
    }

    // If we're searching for the first time, backup the original conversations
    if (originalConversations.value.length === 0) {
        originalConversations.value = cloneDeep(conversations.value);
    }

    // Filter conversations based on search query
    const query = searchQuery.value.toLowerCase();

    // Search in chats (private) and groups based on schema structure
    const filteredConversations = originalConversations.value.filter((conv) => {
        if (conv.type === "group") {
            // For groups, search by name
            return conv.name.toLowerCase().includes(query);
        } else {
            // For private chats, search by other user's name
            return getConversationName(conv).toLowerCase().includes(query);
        }
    });

    // Update conversations with filtered results
    conversations.value = cloneDeep(filteredConversations);
};

// Get username by ID
const getUserName = (userId) => {
    if (!userId) return "Unknown User";
    const user = users.value.find((u) => u.uid === userId);
    return user ? user.username : "Unknown User";
};

// Get conversation display name
const getConversationName = (chat) => {
    if (!chat) return "";

    if (chat.type === "group") {
        return chat.name || "Group Chat";
    }

    // For private chats, find the other user
    const otherUserId = chat.users?.find((id) => id !== currentUser.value?.uid);
    if (!otherUserId) return "Private Chat";

    const otherUser = users.value.find((u) => u.uid === otherUserId);
    return otherUser ? otherUser.username : "Private Chat";
};

// Get conversation profile picture
const getConversationPfp = (chat) => {
    if (!chat) return "https://ui-avatars.com/api/?name=Chat";

    if (chat.type === "group") {
        return (
            chat.pfp ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                chat.name || "Group"
            )}`
        );
    }

    // For private chats, get the other user's profile picture
    const otherUserId = chat.users?.find((id) => id !== currentUser.value?.uid);
    if (!otherUserId) return "https://ui-avatars.com/api/?name=Chat";

    const otherUser = users.value.find((u) => u.uid === otherUserId);
    return (
        otherUser?.pfp ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            otherUser?.username || "User"
        )}`
    );
};

// Get active chat name and profile picture
const getActiveChatName = () => {
    return activeChat.value.name || getConversationName(activeChat.value);
};

const getActiveChatPfp = () => {
    return activeChat.value.pfp || getConversationPfp(activeChat.value);
};

// Select a conversation
const selectConversation = async (chat) => {
    if (!chat) return;

    console.log("Selecting conversation:", chat);

    // Clean up existing messages before loading new ones
    messages.value = [];
    messageLoading.value = true;

    // Update activeChat reference
    activeChat.value = cloneDeep(chat); // Use cloneDeep instead of spread operator

    // Set chatType first
    chatType.value = chat.type;

    if (chat.type === "private") {
        // For private chats, use chatKey as the identifier
        if (!chat.chatKey) {
            console.error("Private chat missing chatKey:", chat);
            // Try to extract from id if available
            if (chat.id) {
                try {
                    // Find the chat document to get its chatKey
                    const chatDoc = await db
                        .collection("chat")
                        .doc(chat.id)
                        .get();
                    if (chatDoc.exists && chatDoc.data().chatKey) {
                        chat.chatKey = chatDoc.data().chatKey;
                        activeChat.value.chatKey = chat.chatKey;
                        console.log(
                            "Retrieved chatKey from document:",
                            chat.chatKey
                        );
                    } else {
                        // Last resort: create a fallback key from users array if available
                        if (chat.users && chat.users.length === 2) {
                            const sortedUsers = [...chat.users].sort();
                            chat.chatKey = `${sortedUsers[0]}_${sortedUsers[1]}`;
                            activeChat.value.chatKey = chat.chatKey;
                            console.log(
                                "Created fallback chatKey:",
                                chat.chatKey
                            );
                        } else {
                            console.error(
                                "Failed to create chatKey - insufficient user data"
                            );
                            messageLoading.value = false;
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Error retrieving chat document:", error);
                    messageLoading.value = false;
                    return;
                }
            } else {
                console.error(
                    "Unable to determine chat identifier - missing both chatKey and id"
                );
                messageLoading.value = false;
                return;
            }
        }

        chatIdentifier.value = chat.chatKey;
        console.log(
            `Set chat identifier to private chatKey: ${chatIdentifier.value}`
        );
    } else if (chat.type === "group") {
        // For group chats, use the document ID as identifier
        if (!chat.uid && chat.id) {
            chat.uid = chat.id;
            activeChat.value.uid = chat.id;
            console.log("Using id as uid for group chat:", chat.id);
        }

        if (!chat.uid) {
            console.error("Group chat missing uid:", chat);
            messageLoading.value = false;
            return; // Don't proceed with an invalid group chat
        }

        chatIdentifier.value = chat.uid;
        console.log(
            `Set chat identifier to group uid: ${chatIdentifier.value}`
        );
    } else {
        console.error("Invalid chat type:", chat.type);
        messageLoading.value = false;
        return;
    }

    console.log("Selection complete. Chat state:", {
        type: chatType.value,
        identifier: chatIdentifier.value,
        activeChat: activeChat.value,
    });
};

// Send a new message
const sendMessage = async () => {
    if (!newMessage.value.trim()) {
        console.log("Message is empty, not sending");
        return;
    }

    if (!chatIdentifier.value) {
        console.error("Cannot send message: Chat identifier is missing");
        // Try to recover the identifier from activeChat if possible
        if (activeChat.value?.type === "private" && activeChat.value?.chatKey) {
            chatIdentifier.value = activeChat.value.chatKey;
            chatType.value = "private";
            console.log(
                "Recovered chatIdentifier from activeChat:",
                chatIdentifier.value
            );
        } else if (
            activeChat.value?.type === "group" &&
            activeChat.value?.uid
        ) {
            chatIdentifier.value = activeChat.value.uid;
            chatType.value = "group";
            console.log(
                "Recovered chatIdentifier from activeChat:",
                chatIdentifier.value
            );
        } else if (activeChat.value?.type === "group" && activeChat.value?.id) {
            // Fallback to id for group chats
            chatIdentifier.value = activeChat.value.id;
            chatType.value = "group";
            console.log(
                "Recovered chatIdentifier from activeChat id:",
                chatIdentifier.value
            );
        } else {
            console.error(
                "Cannot recover chat identifier from activeChat:",
                activeChat.value
            );
            return;
        }
    }

    try {
        // Create message data
        const messageData = {
            content: newMessage.value,
            sender_id: currentUser.value.uid,
            created_at: new Date(),
        };

        console.log(`Sending message to chat: ${chatIdentifier.value}`);

        // Clear the input field immediately for better UX
        newMessage.value = "";

        // Send message using the helper function
        await addMessageToChat(chatIdentifier.value, messageData);

        // Auto-scroll to the bottom after sending
        setTimeout(() => {
            const messagesContainer = document.querySelector(".chat-messages");
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    } catch (error) {
        console.error("Error sending message:", error);
        // Show a notification or handle the error (could add a notification system)
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

// Lifecycle hooks
onMounted(async () => {
    isLoading.value = true;

    try {
        // Check authentication
        if (!isAuthenticated.value && !authLoading.value) {
            router.push("/login");
            return;
        }

        // Get current user (from auth)
        currentUser.value = auth.currentUser;

        // Get all users
        const { users: fetchedUsers } = await getAllUsers();
        users.value = fetchedUsers.value || [];

        // Back up original conversations once they're loaded
        watch(
            conversations,
            (newConversations) => {
                if (
                    newConversations.length > 0 &&
                    originalConversations.value.length === 0
                ) {
                    originalConversations.value = cloneDeep(newConversations);
                }
            },
            { immediate: true }
        );

        // Set up window resize listener
        window.addEventListener("resize", handleResize);
    } catch (error) {
        console.error("Error initializing data:", error);
    } finally {
        isLoading.value = false;
    }
});

// Clean up event listeners when component unmounts
onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
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
    text-align: center;
    flex-direction: column;
}

.chat-placeholder h3 {
    padding: 20px 30px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* No messages indicator */
.no-messages {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #999;
    font-size: 16px;
    text-align: center;
    padding: 20px;
    flex-direction: column;
}

.no-messages p {
    padding: 15px 25px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Message loading spinner */
.message-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
}

.message-loading .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}

.message-loading p {
    font-size: 14px;
}

/* Improve message display */
.message-wrapper {
    display: flex;
    width: 100%;
    margin-bottom: 24px;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-wrapper.sent {
    justify-content: flex-end;
}

.message-wrapper.received {
    justify-content: flex-start;
}

.message-content {
    max-width: 60%;
    padding: 10px 15px;
    border-radius: 18px;
    position: relative;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sent .message-content {
    background-color: #dcf8c6;
    border-bottom-right-radius: 4px;
}

.received .message-content {
    background-color: #e9e9eb;
    border-bottom-left-radius: 4px;
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

/* Loading styles */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: #666;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
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

.chat-messages {
    padding: 20px;
    height: calc(100% - 140px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
}
</style>
