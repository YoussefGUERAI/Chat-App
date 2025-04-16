import { db, auth } from "@/firebase/config";
import { ref, watchEffect } from "vue";

/**
 * Composable for fetching messages for a specific chat
 * @param {string} chatId - The chat ID (uid for groups, chatKey for private chats)
 * @param {string} chatType - The chat type ("private" or "group")
 * @returns {Object} - Contains messages array, error, loading status, and refresh function
 */
export function useMessages(chatId, chatType) {
    const messages = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const unsubscribe = ref(null);
    const chatDocRef = ref(null);

    // Cache for private chat document references
    const chatCache = {};

    const loadMessages = async () => {
        // Clear existing data and listener
        if (unsubscribe.value) {
            unsubscribe.value();
            unsubscribe.value = null;
        }

        messages.value = [];
        error.value = null;
        loading.value = true;

        if (!chatId) {
            error.value = "Chat ID is required";
            loading.value = false;
            return;
        }

        try {
            // Determine collection path based on chat type
            const collectionPath = chatType === "private" ? "chat" : "group";

            // For private chats with chatKey format
            if (chatType === "private") {
                console.log(
                    "Loading private chat messages for chatKey:",
                    chatId
                );

                // Check cache first to avoid redundant queries
                if (chatCache[chatId]) {
                    chatDocRef.value = chatCache[chatId];
                    console.log("Using cached chat document reference");
                } else {
                    // Query the chat collection to find the document with matching chatKey
                    try {
                        const chatSnapshot = await db
                            .collection("chat")
                            .where("chatKey", "==", chatId)
                            .limit(1)
                            .get();

                        if (chatSnapshot.empty) {
                            console.error(
                                "No chat found with chatKey:",
                                chatId
                            );
                            error.value = "Chat not found";
                            loading.value = false;
                            return;
                        }

                        chatDocRef.value = chatSnapshot.docs[0].ref;
                        // Cache the document reference for future use
                        chatCache[chatId] = chatDocRef.value;
                    } catch (err) {
                        console.error("Error finding chat document:", err);
                        error.value = `Error finding chat: ${err.message}`;
                        loading.value = false;
                        return;
                    }
                }

                // Set up listener for messages using the found document reference
                unsubscribe.value = chatDocRef.value
                    .collection("messages")
                    .orderBy("created_at", "desc") // Get newest messages first
                    .limit(50) // Limit to most recent 50 messages for better performance
                    .onSnapshot(
                        (msgSnapshot) => {
                            // Transform and reverse to display in ascending order
                            const newMessages = msgSnapshot.docs
                                .map((doc) => ({
                                    id: doc.id,
                                    ...doc.data(),
                                }))
                                .reverse();

                            messages.value = newMessages;
                            loading.value = false;
                        },
                        (err) => {
                            error.value = `Error fetching messages: ${err.message}`;
                            console.error("Error fetching messages:", err);
                            loading.value = false;
                        }
                    );
            } else {
                // For group chats, directly access by document ID
                console.log(
                    "Loading group chat messages for group ID:",
                    chatId
                );

                unsubscribe.value = db
                    .collection(collectionPath)
                    .doc(chatId)
                    .collection("messages")
                    .orderBy("created_at", "desc")
                    .limit(50) // Limit to most recent 50 messages for better performance
                    .onSnapshot(
                        (snapshot) => {
                            // Transform and reverse to display in ascending order
                            const newMessages = snapshot.docs
                                .map((doc) => ({
                                    id: doc.id,
                                    ...doc.data(),
                                }))
                                .reverse();

                            messages.value = newMessages;
                            loading.value = false;
                        },
                        (err) => {
                            error.value = `Error fetching messages: ${err.message}`;
                            console.error("Error fetching messages:", err);
                            loading.value = false;
                        }
                    );
            }
        } catch (err) {
            error.value = `Error setting up message listener: ${err.message}`;
            console.error("Error setting up message listener:", err);
            loading.value = false;
        }
    };

    // Setup and cleanup with watchEffect
    watchEffect((onCleanup) => {
        // Use immediate async function to avoid watchEffect restrictions
        (async () => {
            await loadMessages();
        })();

        onCleanup(() => {
            if (unsubscribe.value) {
                unsubscribe.value();
                unsubscribe.value = null;
            }
        });
    });

    return {
        messages,
        error,
        loading,
        refresh: loadMessages,
    };
}

/**
 * Composable for sending a message to a chat
 * @param {string} chatId - The chat ID
 * @param {string} chatType - The chat type ("private" or "group")
 * @returns {Object} - Contains sendMessage function, error, and loading status
 */
export function useSendMessage(chatId, chatType) {
    const error = ref(null);
    const loading = ref(false);

    const sendMessage = async (content) => {
        if (!chatId || !content.trim()) {
            error.value = "Chat ID and message content are required";
            return false;
        }

        error.value = null;
        loading.value = true;

        try {
            if (!auth.currentUser) {
                throw new Error("User not authenticated");
            }

            const collectionPath = chatType === "private" ? "chat" : "group";
            const messageData = {
                content: content.trim(),
                sender_id: auth.currentUser.uid,
                created_at: new Date(),
            };

            // Add message to the chat
            await db
                .collection(collectionPath)
                .doc(chatId)
                .collection("messages")
                .add(messageData);

            // Update the last message and timestamp on the chat/group document
            await db
                .collection(collectionPath)
                .doc(chatId)
                .update({
                    lastMessage: {
                        content: content.trim(),
                        sender_id: auth.currentUser.uid,
                    },
                    lastUpdate: new Date(),
                });

            loading.value = false;
            return true;
        } catch (err) {
            error.value = `Error sending message: ${err.message}`;
            console.error("Error sending message:", err);
            loading.value = false;
            return false;
        }
    };

    return { sendMessage, error, loading };
}

/**
 * Helper function to add a message to a chat (without composable structure)
 * @param {string} chatId - The chat ID (uid for groups, chatKey for private chats)
 * @param {Object} messageData - The message data to add
 */
export async function addMessageToChat(chatId, messageData) {
    if (!chatId || !messageData.content) {
        throw new Error("Chat ID and message content are required");
    }

    try {
        if (!auth.currentUser) {
            throw new Error("User not authenticated");
        }

        // Determine if this is a private chat or group chat
        // Check if the ID has the format of a chatKey (has an underscore)
        const isPrivateChat = chatId.includes("_");
        const collectionPath = isPrivateChat ? "chat" : "group";

        console.log(
            `Adding message to ${
                isPrivateChat ? "private" : "group"
            } chat: ${chatId}`
        );

        // Add created_at if not provided
        if (!messageData.created_at) {
            messageData.created_at = new Date();
        }

        // Add sender_id if not provided
        if (!messageData.sender_id) {
            messageData.sender_id = auth.currentUser.uid;
        }

        // For private chats, we need to first find the document by chatKey
        if (isPrivateChat) {
            // Query to find the chat document with this chatKey
            const chatQuerySnapshot = await db
                .collection("chat")
                .where("chatKey", "==", chatId)
                .limit(1)
                .get();

            if (chatQuerySnapshot.empty) {
                console.error(`No chat found with chatKey: ${chatId}`);

                // Try to create the chat if it doesn't exist
                if (chatId.includes("_")) {
                    const userIds = chatId.split("_");
                    if (userIds.length === 2) {
                        console.log(
                            `Creating new chat with users: ${userIds.join(
                                ", "
                            )}`
                        );

                        // Create new chat document
                        const newChatRef = db.collection("chat").doc();
                        await newChatRef.set({
                            chatKey: chatId,
                            type: "private",
                            users: userIds,
                            createdAt: new Date(),
                            lastUpdate: new Date(),
                        });

                        // Add message to the new chat
                        await newChatRef
                            .collection("messages")
                            .add(messageData);

                        // Update last message info
                        await newChatRef.update({
                            lastMessage: {
                                content: messageData.content,
                                sender_id: messageData.sender_id,
                            },
                            lastUpdate: new Date(),
                        });

                        return true;
                    }
                }

                throw new Error(`No chat found with chatKey: ${chatId}`);
            }

            // Get the actual document ID
            const chatDocRef = chatQuerySnapshot.docs[0].ref;

            // Add message to the chat
            await chatDocRef.collection("messages").add(messageData);

            // Update the last message and timestamp on the chat document
            await chatDocRef.update({
                lastMessage: {
                    content: messageData.content,
                    sender_id: messageData.sender_id,
                },
                lastUpdate: new Date(),
            });
        } else {
            // For group chats, we can access directly by ID
            const docRef = db.collection(collectionPath).doc(chatId);

            // Check if group exists
            const docSnapshot = await docRef.get();
            if (!docSnapshot.exists) {
                throw new Error(`Group chat with ID ${chatId} does not exist`);
            }

            // Add message to the chat
            await docRef.collection("messages").add(messageData);

            // Update the last message and timestamp on the chat/group document
            await docRef.update({
                lastMessage: {
                    content: messageData.content,
                    sender_id: messageData.sender_id,
                },
                lastUpdate: new Date(),
            });
        }

        return true;
    } catch (err) {
        console.error("Error adding message to chat:", err);
        throw err;
    }
}

/**
 * Get all messages for a user from all chats
 * @param {string} userId - The user ID
 * @returns {Object} - Contains messages array and error
 */
export function useAllUserMessages(userId) {
    const messages = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const unsubscribes = ref([]);

    const loadAllMessages = () => {
        // Clear existing data
        messages.value = [];
        error.value = null;
        loading.value = true;

        // Unsubscribe from previous listeners
        if (unsubscribes.value.length > 0) {
            unsubscribes.value.forEach((unsub) => unsub());
            unsubscribes.value = [];
        }

        if (!userId) {
            error.value = "User ID is required";
            loading.value = false;
            return;
        }

        try {
            // Listen for private chat messages
            const privateUnsubscribe = db
                .collection("chat")
                .where("users", "array-contains", userId)
                .onSnapshot(
                    (chatSnapshot) => {
                        chatSnapshot.forEach((chatDoc) => {
                            const chatId = chatDoc.id;

                            const messageUnsubscribe = db
                                .collection("chat")
                                .doc(chatId)
                                .collection("messages")
                                .orderBy("created_at", "desc")
                                .onSnapshot(
                                    (msgSnapshot) => {
                                        const chatMessages =
                                            msgSnapshot.docs.map((doc) => ({
                                                id: doc.id,
                                                chatId,
                                                chatType: "private",
                                                ...doc.data(),
                                            }));

                                        // Update messages array with new messages
                                        messages.value = [
                                            ...messages.value.filter(
                                                (m) =>
                                                    !(
                                                        m.chatType ===
                                                            "private" &&
                                                        m.chatId === chatId
                                                    )
                                            ),
                                            ...chatMessages,
                                        ].sort((a, b) => {
                                            const timestampA = a.created_at
                                                ?.toMillis
                                                ? a.created_at.toMillis()
                                                : 0;
                                            const timestampB = b.created_at
                                                ?.toMillis
                                                ? b.created_at.toMillis()
                                                : 0;
                                            return timestampB - timestampA;
                                        });
                                    },
                                    (err) => {
                                        console.error(
                                            `Error fetching messages for chat ${chatId}:`,
                                            err
                                        );
                                    }
                                );

                            unsubscribes.value.push(messageUnsubscribe);
                        });
                    },
                    (err) => {
                        error.value = `Error fetching chats: ${err.message}`;
                        console.error("Error fetching chats:", err);
                    }
                );

            unsubscribes.value.push(privateUnsubscribe);

            // Listen for group chat messages
            const groupUnsubscribe = db
                .collection("group")
                .where("users", "array-contains", userId)
                .onSnapshot(
                    (groupSnapshot) => {
                        groupSnapshot.forEach((groupDoc) => {
                            const groupId = groupDoc.id;

                            const messageUnsubscribe = db
                                .collection("group")
                                .doc(groupId)
                                .collection("messages")
                                .orderBy("created_at", "desc")
                                .onSnapshot(
                                    (msgSnapshot) => {
                                        const groupMessages =
                                            msgSnapshot.docs.map((doc) => ({
                                                id: doc.id,
                                                chatId: groupId,
                                                chatType: "group",
                                                ...doc.data(),
                                            }));

                                        // Update messages array with new messages
                                        messages.value = [
                                            ...messages.value.filter(
                                                (m) =>
                                                    !(
                                                        m.chatType ===
                                                            "group" &&
                                                        m.chatId === groupId
                                                    )
                                            ),
                                            ...groupMessages,
                                        ].sort((a, b) => {
                                            const timestampA = a.created_at
                                                ?.toMillis
                                                ? a.created_at.toMillis()
                                                : 0;
                                            const timestampB = b.created_at
                                                ?.toMillis
                                                ? b.created_at.toMillis()
                                                : 0;
                                            return timestampB - timestampA;
                                        });

                                        loading.value = false;
                                    },
                                    (err) => {
                                        console.error(
                                            `Error fetching messages for group ${groupId}:`,
                                            err
                                        );
                                    }
                                );

                            unsubscribes.value.push(messageUnsubscribe);
                        });
                    },
                    (err) => {
                        error.value = `Error fetching groups: ${err.message}`;
                        console.error("Error fetching groups:", err);
                    }
                );

            unsubscribes.value.push(groupUnsubscribe);
        } catch (err) {
            error.value = `Error setting up message listeners: ${err.message}`;
            console.error("Error setting up message listeners:", err);
            loading.value = false;
        }
    };

    // Initialize message loading
    loadAllMessages();

    // Cleanup function
    const cleanup = () => {
        if (unsubscribes.value.length > 0) {
            unsubscribes.value.forEach((unsub) => unsub());
            unsubscribes.value = [];
        }
    };

    return {
        messages,
        error,
        loading,
        refresh: loadAllMessages,
        cleanup,
    };
}
