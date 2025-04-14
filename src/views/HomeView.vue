<template>
    <div class="container">
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
                        v-for="chat in individualChats"
                        :key="chat.uid"
                        class="conversation-item"
                        @click="selectConversation(chat, 'chat')"
                    >
                        <img
                            :src="getOtherUserPfp(chat)"
                            alt="profile"
                            class="conversation-pic"
                        />
                        <div class="conversation-info">
                            <h4>{{ getOtherUsername(chat) }}</h4>
                            <p>{{ chat.lastMessage?.content || "" }}</p>
                        </div>
                    </div>

                    <!-- Group chats -->
                    <div
                        v-for="group in userGroups"
                        :key="group.uid"
                        class="conversation-item"
                        @click="selectConversation(group, 'group')"
                    >
                        <img
                            :src="group.pfp"
                            alt="group"
                            class="conversation-pic"
                        />
                        <div class="conversation-info">
                            <h4>{{ group.name }}</h4>
                            <p>{{ group.lastMessage?.content || "" }}</p>
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
                            v-for="chat in individualChats"
                            :key="chat.uid"
                            class="conversation-item"
                            @click="selectConversation(chat, 'chat')"
                        >
                            <img
                                :src="getOtherUserPfp(chat)"
                                alt="profile"
                                class="conversation-pic"
                            />
                            <div class="conversation-info">
                                <h4>{{ getOtherUsername(chat) }}</h4>
                                <p>{{ chat.lastMessage?.content || "" }}</p>
                            </div>
                        </div>

                        <!-- Group chats -->
                        <div
                            v-for="group in userGroups"
                            :key="group.uid"
                            class="conversation-item"
                            @click="selectConversation(group, 'group')"
                        >
                            <img
                                :src="group.pfp"
                                alt="group"
                                class="conversation-pic"
                            />
                            <div class="conversation-info">
                                <h4>{{ group.name }}</h4>
                                <p>{{ group.lastMessage?.content || "" }}</p>
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
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

// Mock data
const MOCK_CURRENT_USER = {
    uid: "1",
    username: "Current User",
    pfp: "https://ui-avatars.com/api/?name=Current+User&background=random",
    status: true,
};

const MOCK_USERS = [
    {
        uid: "2",
        username: "Alice Smith",
        pfp: "https://ui-avatars.com/api/?name=Alice+Smith&background=random",
        status: true,
    },
    {
        uid: "3",
        username: "Bob Johnson",
        pfp: "https://ui-avatars.com/api/?name=Bob+Johnson&background=random",
        status: false,
    },
    {
        uid: "4",
        username: "Carol White",
        pfp: "https://ui-avatars.com/api/?name=Carol+White&background=random",
        status: true,
    },
];

const MOCK_CHATS = [
    {
        uid: "c1",
        users: ["1", "2"],
        type: "chat",
        lastMessage: { content: "Hey, how are you?" },
        lastUpdate: new Date(Date.now() - 2400000),
    },
    {
        uid: "c2",
        users: ["1", "3"],
        type: "chat",
        lastMessage: { content: "Can we meet tomorrow?" },
        lastUpdate: new Date(Date.now() - 82800000),
    },
];

const MOCK_GROUPS = [
    {
        uid: "g1",
        name: "Project Team",
        pfp: "https://ui-avatars.com/api/?name=Project+Team&background=random",
        bio: "Team discussion group",
        type: "group",
        users: ["1", "2", "3"],
        lastMessage: { content: "Meeting at 3 PM" },
        lastUpdate: new Date(Date.now() - 3600000),
    },
    {
        uid: "g2",
        name: "Family Group",
        pfp: "https://ui-avatars.com/api/?name=Family+Group&background=random",
        bio: "Family chat",
        type: "group",
        users: ["1", "3", "4"],
        lastMessage: { content: "Who's coming for dinner?" },
        lastUpdate: new Date(Date.now() - 10800000),
    },
];

const MOCK_MESSAGES = {
    c1: [
        {
            uid: "m1",
            content: "Hey, how are you?",
            sender: "2",
            createdAt: new Date(Date.now() - 3600000),
        },
        {
            uid: "m2",
            content: "I'm good, thanks!",
            sender: "1",
            createdAt: new Date(Date.now() - 3000000),
        },
        {
            uid: "m3",
            content: "What's up?",
            sender: "2",
            createdAt: new Date(Date.now() - 2400000),
        },
    ],
    c2: [
        {
            uid: "m4",
            content: "Can we meet tomorrow?",
            sender: "3",
            createdAt: new Date(Date.now() - 86400000),
        },
        {
            uid: "m5",
            content: "Sure, what time?",
            sender: "1",
            createdAt: new Date(Date.now() - 82800000),
        },
    ],
    g1: [
        {
            uid: "m6",
            content: "Meeting at 3 PM",
            sender: "2",
            createdAt: new Date(Date.now() - 7200000),
        },
        {
            uid: "m7",
            content: "I'll be there",
            sender: "1",
            createdAt: new Date(Date.now() - 3600000),
        },
    ],
    g2: [
        {
            uid: "m8",
            content: "Who's coming for dinner?",
            sender: "3",
            createdAt: new Date(Date.now() - 14400000),
        },
        {
            uid: "m9",
            content: "Count me in!",
            sender: "1",
            createdAt: new Date(Date.now() - 10800000),
        },
    ],
};

export default {
    name: "HomeView",
    setup() {
        const searchQuery = ref("");
        const searchResults = ref([]);
        const individualChats = ref(MOCK_CHATS);
        const userGroups = ref(MOCK_GROUPS);
        const messages = ref([]);
        const activeChat = ref({});
        const newMessage = ref("");
        const currentUser = ref(MOCK_CURRENT_USER);

        // Add isMobile computed property
        const isMobile = ref(window.innerWidth <= 768);

        // Add resize listener
        const handleResize = () => {
            isMobile.value = window.innerWidth <= 768;
        };

        onMounted(() => {
            window.addEventListener("resize", handleResize);
        });

        onUnmounted(() => {
            window.removeEventListener("resize", handleResize);
        });

        const handleSearch = () => {
            if (searchQuery.value.trim() === "") {
                searchResults.value = [];
                return;
            }

            const query = searchQuery.value.toLowerCase();
            const matchingUsers = MOCK_USERS.filter((user) =>
                user.username.toLowerCase().includes(query)
            );
            const matchingGroups = MOCK_GROUPS.filter((group) =>
                group.name.toLowerCase().includes(query)
            );

            searchResults.value = [...matchingUsers, ...matchingGroups];
        };

        const getOtherUserPfp = (chat) => {
            const otherUserId = chat.users.find(
                (uid) => uid !== currentUser.value.uid
            );
            const user = MOCK_USERS.find((u) => u.uid === otherUserId);
            return (
                user?.pfp ||
                "https://ui-avatars.com/api/?name=User&background=random"
            );
        };

        const getOtherUsername = (chat) => {
            const otherUserId = chat.users.find(
                (uid) => uid !== currentUser.value.uid
            );
            const user = MOCK_USERS.find((u) => u.uid === otherUserId);
            return user?.username || "Unknown User";
        };

        const selectConversation = (conversation, type) => {
            activeChat.value = {
                ...conversation,
                type: type || conversation.type,
            };
            messages.value = MOCK_MESSAGES[conversation.uid] || [];
        };

        const goToProfile = () => {
            console.log("Go to profile");
        };

        const openNewChat = () => {
            console.log("Open new chat");
        };

        const createNewGroup = () => {
            console.log("Create new group");
        };

        const handleLogout = () => {
            console.log("Logout");
        };

        const sendMessage = () => {
            if (!newMessage.value.trim() || !activeChat.value.uid) return;

            const newMsg = {
                uid: `m${Date.now()}`,
                content: newMessage.value,
                sender: currentUser.value.uid,
                createdAt: new Date(),
            };

            if (!MOCK_MESSAGES[activeChat.value.uid]) {
                MOCK_MESSAGES[activeChat.value.uid] = [];
            }
            MOCK_MESSAGES[activeChat.value.uid].push(newMsg);
            messages.value = MOCK_MESSAGES[activeChat.value.uid];
            newMessage.value = "";
        };

        const formatTimestamp = (timestamp) => {
            return timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        };

        const getUsernameById = (uid) => {
            const user = MOCK_USERS.find((u) => u.uid === uid);
            return user?.username || "Unknown User";
        };

        const getMessageClass = (message) => {
            const isCurrentUser = message.sender === currentUser.value.uid;
            if (activeChat.value.type === "chat") {
                return ["message-content", isCurrentUser ? "sent" : "received"];
            }
            // For group chats
            return [
                "message-content",
                "group-message",
                isCurrentUser ? "sent" : "received",
            ];
        };

        return {
            searchQuery,
            searchResults,
            individualChats,
            userGroups,
            messages,
            activeChat,
            newMessage,
            currentUser,
            handleSearch,
            sendMessage,
            formatTimestamp,
            getOtherUserPfp,
            getOtherUsername,
            selectConversation,
            goToProfile,
            openNewChat,
            handleLogout,
            createNewGroup,
            getUsernameById,
            getMessageClass,
            isMobile,
        };
    },
};
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
