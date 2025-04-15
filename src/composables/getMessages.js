import { db } from "@/firebase/config";
import { ref, onMounted } from "vue";

const messages = ref([]);
const error = ref(null);

async function getMessages(targetID) {
    try {
        await onMounted(async () => {
            try {
                // Clear previous messages and error
                messages.value = [];
                error.value = null;

                // Listen for chat messages
                const chatUnsubscribe = await db
                    .collection("chat")
                    .where("users", "array-contains", targetID)
                    .collection("messages")
                    .onSnapshot(
                        (snapshot) => {
                            const newMessages = snapshot.docs.map((doc) =>
                                doc.data()
                            );
                            messages.value = [
                                ...messages.value,
                                ...newMessages,
                            ];
                        },
                        (err) => {
                            error.value = `Error fetching chat messages: ${err.message}`;
                            console.error("Error fetching chat messages:", err);
                        }
                    );

                // Listen for group messages
                const groupUnsubscribe = await db
                    .collection("group")
                    .where("users", "array-contains", targetID)
                    .collection("messages")
                    .onSnapshot(
                        (snapshot) => {
                            const newMessages = snapshot.docs.map((doc) =>
                                doc.data()
                            );
                            messages.value = [
                                ...messages.value,
                                ...newMessages,
                            ];
                        },
                        (err) => {
                            error.value = `Error fetching group messages: ${err.message}`;
                            console.error(
                                "Error fetching group messages:",
                                err
                            );
                        }
                    );

                // Sort messages by timestamp
                messages.value.sort((a, b) => a.createdAt - b.createdAt);

                // Return cleanup function
                return () => {
                    chatUnsubscribe();
                    groupUnsubscribe();
                };
            } catch (err) {
                error.value = `Error setting up message listeners: ${err.message}`;
                console.error("Error setting up message listeners:", err);
            }
        });
    } catch (err) {
        error.value = `Error initializing messages: ${err.message}`;
        console.error("Error initializing messages:", err);
    }

    return { messages, error };
}

export { getMessages, messages, error };
